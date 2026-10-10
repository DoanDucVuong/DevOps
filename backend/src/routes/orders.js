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

// POST /api/orders  { items:[{productId,color,size,quantity,image?}], shipping:{...}, paymentMethod }
// Giá và tổng tiền được tính lại ở server từ bảng products (không tin dữ liệu giá từ client).
router.post('/', requireAuth, async (req, res) => {
  const { items, shipping, paymentMethod } = req.body
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
  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shippingFee
  const cleanShipping = {
    fullName: String(shipping.fullName).trim(), phone: String(shipping.phone).trim(),
    address: String(shipping.address).trim(), city: String(shipping.city).trim(),
    note: String(shipping.note || '').slice(0, 500),
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
  res.status(201).json({ orderId: id, code: `DH${String(id).padStart(6, '0')}`, total, shippingFee, status: 'pending' })
})

// GET /api/orders/me
router.get('/me', requireAuth, async (req, res) => {
  const rows = await query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, id DESC', [String(req.user.id)])
  res.json(rows.map(parseOrder))
})

module.exports = router
module.exports.parseOrder = parseOrder
