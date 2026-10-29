const express = require('express')
const { query } = require('../db')
const { requireAuth } = require('../middleware/auth')
const vnpayService = require('../services/vnpayService')

const router = express.Router()
const FREE_SHIP_THRESHOLD = 500000
const SHIPPING_FEE = 30000
const PAYMENT_METHODS = ['cod', 'vnpay', 'bank', 'vietqr', 'wallet']

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

function getClientIp(req) {
  let ip = req.headers['x-forwarded-for'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           '127.0.0.1'
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0].trim()
  }
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1'
  }
  return ip || '127.0.0.1'
}

function getFrontendUrl(req, orderShipping = null) {
  if (orderShipping && orderShipping.frontendUrl) {
    return orderShipping.frontendUrl.replace(/\/+$/, '')
  }
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/+$/, '')
  }
  const host = req.get('host') || ''
  if (host.includes('54.79.14.7')) {
    return 'http://54.79.14.7'
  }
  if (host.includes('localhost:4000') || host.includes('127.0.0.1:4000')) {
    return 'http://localhost:5173'
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}`
}

function getVNPayReturnUrl(req) {
  if (process.env.VNP_RETURN_URL) {
    return process.env.VNP_RETURN_URL
  }
  const host = req.get('host') || 'localhost:4000'
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http'
  return `${proto}://${host}/api/orders/vnpay_return`
}

/**
 * Hàm khởi tạo và lưu trữ đơn hàng vào CSDL
 */
async function createOrderRecord(req, forcedPaymentMethod) {
  const shippingInfo = req.body.shipping_info || req.body.shipping || {}
  const paymentMethod = forcedPaymentMethod || req.body.payment_method || req.body.paymentMethod || 'cod'
  const voucherCode = req.body.voucher_code || req.body.voucherCode
  const items = req.body.items || []

  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    throw { status: 400, message: 'Giỏ hàng trống hoặc không hợp lệ.' }
  }

  const fullName = String(shippingInfo.fullName || shippingInfo.full_name || shippingInfo.name || '').trim()
  const phone = String(shippingInfo.phone || '').trim()
  const address = String(shippingInfo.address || '').trim()
  const city = String(shippingInfo.city || '').trim()
  const note = String(shippingInfo.note || '').slice(0, 500)

  if (!fullName || !phone || !address || !city) {
    throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin giao hàng (họ tên, số điện thoại, địa chỉ, tỉnh/thành phố).' }
  }

  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    throw { status: 400, message: 'Phương thức thanh toán không hợp lệ.' }
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
      throw { status: 400, message: `Số lượng sản phẩm không hợp lệ: ${pid}` }
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
    frontendUrl: req.headers.origin || req.headers.referer || null,
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

  // Mỗi sản phẩm đã mua = 1 interaction "purchase" & tăng sold_count thực tế
  for (const l of lines) {
    if (l.productId) {
      try {
        await query("INSERT INTO interactions (user_id, product_id, interaction_type) VALUES (?, ?, 'purchase')",
          [String(req.user.id), l.productId])
        await query("UPDATE products SET sold_count = COALESCE(sold_count, 0) + ? WHERE id = ?",
          [Number(l.quantity || 1), l.productId])
      } catch {}
    }
  }

  return {
    id,
    orderCode,
    total,
    shippingFee,
    discountAmount,
    shipping: cleanShipping,
    items: lines,
  }
}

// POST /api/orders (Tạo đơn hàng COD hoặc các phương thức khác)
router.post('/', requireAuth, async (req, res) => {
  try {
    const result = await createOrderRecord(req)
    res.status(201).json({
      success: true,
      orderId: result.id,
      id: result.id,
      code: result.orderCode,
      total: result.total,
      shippingFee: result.shippingFee,
      discountAmount: result.discountAmount,
      status: 'pending',
      message: 'Đặt hàng thành công!'
    })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error('[create order error]', err)
    res.status(500).json({ message: 'Lỗi máy chủ khi tạo đơn hàng.' })
  }
})

// POST /api/orders/create_payment_url (Tạo đơn VNPay & trả về URL chuyển hướng sang cổng VNPay)
router.post('/create_payment_url', requireAuth, async (req, res) => {
  try {
    let orderId = req.body.orderId || req.body.id
    let totalAmount = 0
    let orderCode = ''

    if (orderId) {
      const rows = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, String(req.user.id)])
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
      }
      totalAmount = Number(rows[0].total_amount)
      orderCode = `DH${String(orderId).padStart(6, '0')}`
    } else {
      const result = await createOrderRecord(req, 'vnpay')
      orderId = result.id
      totalAmount = result.total
      orderCode = result.orderCode
    }

    const ipAddr = getClientIp(req)
    const returnUrl = getVNPayReturnUrl(req)

    const paymentUrl = vnpayService.createPaymentUrl({
      orderId,
      amount: totalAmount,
      orderInfo: `Thanh toan don hang ${orderCode}`,
      ipAddr,
      returnUrl,
      bankCode: req.body.bankCode || '',
    })

    res.json({
      success: true,
      paymentUrl,
      orderId,
      code: orderCode,
      total: totalAmount,
      message: 'Tạo URL thanh toán VNPay thành công.'
    })
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error('[create_payment_url error]', err)
    res.status(500).json({ message: 'Không thể khởi tạo cổng thanh toán VNPay lúc này.' })
  }
})

// GET /api/orders/vnpay_return (Callback từ VNPay khi người dùng hoàn tất thanh toán)
router.get('/vnpay_return', async (req, res) => {
  try {
    const result = vnpayService.verifyReturnUrl(req.query)
    const orderId = result.orderId
    const orderCode = `DH${String(orderId).padStart(6, '0')}`

    let order = null
    if (orderId) {
      const rows = await query('SELECT * FROM orders WHERE id = ?', [orderId])
      if (rows.length > 0) order = rows[0]
    }

    const shipping = order?.shipping_json ? JSON.parse(order.shipping_json) : null
    const frontendBase = getFrontendUrl(req, shipping)

    if (result.isValid && result.isSuccess) {
      if (order) {
        await query("UPDATE orders SET status = 'paid' WHERE id = ?", [orderId])
      }
      return res.redirect(
        `${frontendBase}/checkout/vnpay-result?status=success&orderId=${orderCode}&numericId=${orderId}&amount=${result.amount}&transNo=${result.transactionNo}&bank=${result.bankCode}`
      )
    } else {
      return res.redirect(
        `${frontendBase}/checkout/vnpay-result?status=failed&orderId=${orderCode}&numericId=${orderId}&code=${result.responseCode || '97'}`
      )
    }
  } catch (err) {
    console.error('[vnpay_return error]', err)
    const frontendBase = getFrontendUrl(req)
    return res.redirect(`${frontendBase}/checkout/vnpay-result?status=failed&message=server_error`)
  }
})

// GET /api/orders/me
router.get('/me', requireAuth, async (req, res) => {
  const rows = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC', [String(req.user.id)])
  res.json(rows.map(parseOrder))
})

module.exports = router
module.exports.parseOrder = parseOrder
