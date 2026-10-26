const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()
const FREE_SHIP_THRESHOLD = 500000
const SHIPPING_FEE = 30000
const PAYMENT_METHODS = ['cod', 'bank', 'wallet']

const parseOrder = (r) => ({
  id: r.id,
  code: `DH${String(r.id).padStart(6, '0')}`,
  status: r.status,
  total: Number(r.total_amount),
  shippingFee: Number(r.shipping_fee),
  paymentMethod: r.payment_method,
  createdAt: r.created_at,
  shipping: r.shipping_json ? JSON.parse(r.shipping_json) : null,
  items: JSON.parse(r.items_json),
})

// POST /api/orders
// Nhận payload: shipping_info, payment_method (cod, bank, wallet), items, voucher_code, total_amount.
router.post('/', requireAuth, async (req, res) => {
  const shippingInfo = req.body.shipping_info || req.body.shipping || {}
  const paymentMethod = req.body.payment_method || req.body.paymentMethod || 'cod'
  const voucherCode = req.body.voucher_code || req.body.voucherCode
  const items = req.body.items || []

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ message: 'Giỏ hàng trống hoặc không hợp lệ.' })
  }

  const fullName = String(shippingInfo.fullName || shippingInfo.full_name || shippingInfo.name || '').trim()
  const phone = String(shippingInfo.phone || '').trim()
  const address = String(shippingInfo.address || '').trim()
  const city = String(shippingInfo.city || '').trim()
  const note = String(shippingInfo.note || '').slice(0, 500)

  if (!fullName || !phone || !address || !city) {
    return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng (họ tên, số điện thoại, địa chỉ, tỉnh/thành phố).' })
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' })
  }

  const pids = [...new Set(items.map((i) => i.productId || i.product_id || i.id).filter(Boolean))]
  const products = pids.length > 0 ? await query(`SELECT * FROM products WHERE id IN (${pids.map(() => '?').join(',')})`, pids) : []
  const map = Object.fromEntries(products.map((p) => [p.id, p]))

  const lines = []
  for (const it of items) {
    const pid = it.productId || it.product_id || it.id
    const p = map[pid]
    const qty = Number(it.quantity)
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return res.status(400).json({ message: `Số lượng sản phẩm không hợp lệ: ${pid}` })
    }
    const price = p ? Number(p.price) : Number(it.price || 0)
    const name = p ? p.name : String(it.name || 'Sản phẩm')
    const img = it.image || (p ? p.image_url : null)

    lines.push({
      productId: pid,
      name,
      price,
      quantity: qty,
      size: String(it.size || ''),
      color: String(it.color || ''),
      image: typeof img === 'string' && img.startsWith('http') ? img.slice(0, 500) : null,
    })
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  let shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE
  let discountAmount = 0
  let appliedVoucher = null

  if (voucherCode && typeof voucherCode === 'string' && voucherCode.trim()) {
    const cleanCode = voucherCode.trim().toUpperCase()
    const vouchers = await query('SELECT * FROM vouchers WHERE UPPER(code) = ? AND is_active = 1', [cleanCode])
    if (vouchers.length > 0) {
      const v = vouchers[0]
      const now = new Date()
      const isExpired = v.expires_at && new Date(v.expires_at) < now
      const isLimitReached = v.usage_limit && v.used_count >= v.usage_limit
      const isEligible = subtotal >= (Number(v.min_order_value) || 0)

      if (!isExpired && !isLimitReached && isEligible) {
        if (v.discount_type === 'percent') {
          discountAmount = Math.round((subtotal * Number(v.discount_value)) / 100)
          if (v.max_discount && discountAmount > Number(v.max_discount)) {
            discountAmount = Number(v.max_discount)
          }
        } else {
          discountAmount = Number(v.discount_value)
        }
        discountAmount = Math.min(discountAmount, subtotal)
        appliedVoucher = v

        // Cập nhật lượt dùng voucher: UPDATE vouchers SET used_count = used_count + 1 WHERE code = ?
        await query('UPDATE vouchers SET used_count = used_count + 1 WHERE UPPER(code) = UPPER(?)', [v.code])
      }
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee)
  const cleanShipping = {
    fullName,
    phone,
    address,
    city,
    note,
  }
  if (appliedVoucher) {
    cleanShipping.voucher = {
      code: appliedVoucher.code,
      discount: discountAmount,
    }
    cleanShipping.note = (cleanShipping.note ? cleanShipping.note + ' | ' : '') + `Mã giảm: ${appliedVoucher.code} (-${discountAmount.toLocaleString('vi-VN')}đ)`
  }

  const rows = await query(
    `INSERT INTO orders (user_id, total_amount, shipping_fee, payment_method, shipping_json, items_json, status)
     VALUES (?, ?, ?, ?, ?, ?, 'pending') RETURNING id`,
    [String(req.user.id), total, shippingFee, paymentMethod, JSON.stringify(cleanShipping), JSON.stringify(lines)]
  )

  const id = rows[0].id
  const orderCode = `DH${String(id).padStart(6, '0')}`

  // Mỗi sản phẩm đã mua = 1 interaction "purchase" -> dữ liệu huấn luyện ML
  for (const l of lines) {
    if (l.productId) {
      try {
        await query("INSERT INTO interactions (user_id, product_id, interaction_type) VALUES (?, ?, 'purchase')",
          [String(req.user.id), l.productId])
      } catch {}
    }
  }

  res.status(201).json({
    success: true,
    orderId: id,
    id: id,
    code: orderCode,
    total,
    shippingFee,
    discountAmount,
    status: 'pending',
    message: 'Đặt hàng thành công!'
  })
})

// GET /api/orders/me
router.get('/me', requireAuth, async (req, res) => {
  const rows = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC', [String(req.user.id)])
  res.json(rows.map(parseOrder))
})

module.exports = router
module.exports.parseOrder = parseOrder
