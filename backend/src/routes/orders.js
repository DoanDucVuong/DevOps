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

// POST /api/orders  { items:[{productId,color,size,quantity,image?}], shipping:{...}, paymentMethod, voucherCode }
// Giá và tổng tiền được tính lại ở server từ bảng products (không tin dữ liệu giá từ client).
router.post('/', requireAuth, async (req, res) => {
  const { items, shipping, paymentMethod, voucherCode } = req.body
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return res.status(400).json({ message: 'Giỏ hàng trống hoặc không hợp lệ.' })
  }
  if (!shipping || !['fullName', 'phone', 'address', 'city'].every((k) => String(shipping[k] || '').trim())) {
    return res.status(400).json({ message: 'Thiếu thông tin giao hàng.' })
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' })
  }

  const ids = [...new Set(items.map((i) => i.productId))]
  const products = await query(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
  const map = Object.fromEntries(products.map((p) => [p.id, p]))

  const lines = []
  for (const it of items) {
    const p = map[it.productId]
    const qty = Number(it.quantity)
    if (!p || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return res.status(400).json({ message: `Sản phẩm không hợp lệ: ${it.productId}` })
    }
    lines.push({
      productId: p.id, name: p.name, price: Number(p.price), quantity: qty,
      size: String(it.size || ''), color: String(it.color || ''),
      image: typeof it.image === 'string' && it.image.startsWith('http') ? it.image.slice(0, 500) : null,
    })
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  let shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE
  let discountAmount = 0
  let appliedVoucher = null

  if (voucherCode && typeof voucherCode === 'string') {
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
        await query('UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?', [v.id])
      }
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee)
  const cleanShipping = {
    fullName: String(shipping.fullName).trim(), phone: String(shipping.phone).trim(),
    address: String(shipping.address).trim(), city: String(shipping.city).trim(),
    note: String(shipping.note || '').slice(0, 500),
  }
  if (appliedVoucher) {
    cleanShipping.voucher = {
      code: appliedVoucher.code,
      discount: discountAmount,
    }
    cleanShipping.note = (cleanShipping.note ? cleanShipping.note + ' | ' : '') + `Mã giảm: ${appliedVoucher.code} (-${discountAmount.toLocaleString('vi-VN')}đ)`
  }

  const rows = await query(
    `INSERT INTO orders (user_id, total_amount, shipping_fee, payment_method, shipping_json, items_json)
     VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
    [String(req.user.id), total, shippingFee, paymentMethod, JSON.stringify(cleanShipping), JSON.stringify(lines)]
  )

  // Mỗi sản phẩm đã mua = 1 interaction "purchase" -> dữ liệu huấn luyện ML
  for (const l of lines) {
    await query("INSERT INTO interactions (user_id, product_id, interaction_type) VALUES (?, ?, 'purchase')",
      [String(req.user.id), l.productId])
  }

  const id = rows[0].id
  res.status(201).json({ orderId: id, code: `DH${String(id).padStart(6, '0')}`, total, shippingFee, discountAmount, status: 'pending' })
})

// GET /api/orders/me
router.get('/me', requireAuth, async (req, res) => {
  const rows = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC', [String(req.user.id)])
  res.json(rows.map(parseOrder))
})

module.exports = router
module.exports.parseOrder = parseOrder
