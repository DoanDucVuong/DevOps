const express = require('express')
const axios = require('axios')
const { query, one } = require('../db')
const { requireAdmin } = require('../middleware/auth')
const { parseOrder } = require('./orders')
const { getMlServiceUrl } = require('../mlConfig')
const { syncAllProductData } = require('../services/syncService')

const router = express.Router()
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''
const STATUSES = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

// SQLite trả chuỗi 'YYYY-MM-DD HH:MM:SS' (UTC), PostgreSQL trả Date
const toDate = (v) => (v instanceof Date ? v : new Date(String(v).replace(' ', 'T') + 'Z'))
const pct = (clicks, impressions) => (impressions > 0 ? +((Number(clicks) / impressions) * 100).toFixed(2) : 0)

// GET /api/admin/dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
  const revenueRow = await one("SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status != 'cancelled'")
  const orderCount = Number((await one('SELECT COUNT(*) AS c FROM orders')).c)
  const userCount = Number((await one("SELECT COUNT(*) AS c FROM users WHERE role = 'user'")).c)
  const interactionCount = Number((await one('SELECT COUNT(*) AS c FROM interactions')).c)

  const ordersByStatus = await query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status')

  // Doanh thu 7 ngày gần nhất — gom nhóm bằng JS để dùng chung cho SQLite/PostgreSQL
  const recent = await query("SELECT total_amount, created_at FROM orders WHERE status != 'cancelled' ORDER BY created_at DESC LIMIT 2000")
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days.push({ date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 })
  }
  for (const o of recent) {
    const key = toDate(o.created_at).toISOString().slice(0, 10)
    const day = days.find((x) => x.date === key)
    if (day) { day.revenue += Number(o.total_amount); day.orders += 1 }
  }

  const rec = await one('SELECT COUNT(*) AS impressions, COALESCE(SUM(is_clicked), 0) AS clicks FROM recommendation_log')
  const byAlgorithm = (await query(
    'SELECT algorithm, COUNT(*) AS impressions, COALESCE(SUM(is_clicked), 0) AS clicks FROM recommendation_log GROUP BY algorithm'
  )).map((r) => ({ algorithm: r.algorithm, impressions: Number(r.impressions), clicks: Number(r.clicks), ctr: pct(r.clicks, Number(r.impressions)) }))

  const topProducts = (await query(
    `SELECT p.id, p.name, COUNT(*) AS interactions
     FROM interactions i JOIN products p ON p.id = i.product_id
     GROUP BY p.id, p.name ORDER BY interactions DESC LIMIT 5`
  )).map((r) => ({ ...r, interactions: Number(r.interactions) }))

  res.json({
    revenue: Number(revenueRow.total), orderCount, userCount, interactionCount,
    ordersByStatus: ordersByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    revenueByDay: days,
    recommendation: { impressions: Number(rec.impressions), clicks: Number(rec.clicks), ctr: pct(rec.clicks, Number(rec.impressions)), byAlgorithm },
    topProducts,
  })
})

// GET /api/admin/orders
router.get('/orders', requireAdmin, async (req, res) => {
  const rows = await query(
    `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email
     FROM orders o LEFT JOIN users u ON CAST(u.id AS TEXT) = o.user_id
     ORDER BY o.created_at DESC, o.id DESC LIMIT 200`
  )
  res.json(rows.map((r) => ({ ...parseOrder(r), customerName: r.customer_name, customerEmail: r.customer_email })))
})

// PATCH /api/admin/orders/:id/status  { status }
router.patch('/orders/:id/status', requireAdmin, async (req, res) => {
  const { status } = req.body
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ.' })
  const rows = await query('UPDATE orders SET status = ? WHERE id = ? RETURNING id', [status, Number(req.params.id)])
  if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' })
  res.json({ id: rows[0].id, status })
})

const mlHeaders = () => (INTERNAL_API_KEY ? { 'x-internal-key': INTERNAL_API_KEY } : {})

// GET /api/admin/ml/status -> chỉ số mô hình + trạng thái huấn luyện
router.get('/ml/status', requireAdmin, async (req, res) => {
  const mlUrl = getMlServiceUrl()
  // Thử gọi với cơ chế retry nếu ML service đang trong quá trình cold-start trên cloud
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { data } = await axios.get(`${mlUrl}/health`, { timeout: attempt === 1 ? 4000 : 12000 })
      return res.json({ ...data, is_ready: true })
    } catch (err) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1200))
        continue
      }
      console.warn(`[admin/ml/status] ML Service (${mlUrl}) đang khởi động hoặc chưa phản hồi:`, err.message)
      return res.json({
        status: 'waking_up',
        is_ready: false,
        message: 'Dịch vụ Machine Learning đang khởi động (Cold-start trên Render). Vui lòng đợi trong giây lát...',
        detail: err.message,
        mlUrl
      })
    }
  }
})

// POST /api/admin/ml/retrain -> huấn luyện lại từ dữ liệu thật (chạy nền trong ML service)
router.post('/ml/retrain', requireAdmin, async (req, res) => {
  const mlUrl = getMlServiceUrl()
  try {
    const { data } = await axios.post(`${mlUrl}/retrain`, {}, { headers: mlHeaders(), timeout: 35000 })
    res.status(202).json(data)
  } catch (err) {
    console.error(`[admin/ml/retrain] Lỗi retrain (${mlUrl}):`, err.message)
    const status = err.response?.status === 409 ? 409 : 502
    res.status(status).json({ message: err.response?.data?.detail || 'Retrain thất bại', detail: err.message, mlUrl })
  }
})

// ==========================================
// QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT - CRUD)
// ==========================================

// GET /api/admin/products?q=&category=&gender=&page=1&limit=20
router.get('/products', requireAdmin, async (req, res) => {
  const { q, category, gender, page = 1, limit = 20 } = req.query
  let where = ' WHERE 1=1'
  const params = []

  if (q && q.trim()) {
    where += ' AND LOWER(p.name) LIKE LOWER(?)'
    params.push(`%${q.trim()}%`)
  }
  if (category && category !== 'all') {
    where += ' AND p.category = ?'
    params.push(category)
  }
  if (gender && gender !== 'all') {
    where += ' AND p.gender = ?'
    params.push(gender)
  }

  const lim = Math.max(1, Math.min(Number(limit) || 20, 200))
  const pg = Math.max(1, Number(page) || 1)
  const offset = (pg - 1) * lim

  const items = await query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category
     ${where}
     ORDER BY p.created_at DESC, p.id ASC
     LIMIT ? OFFSET ?`,
    [...params, lim, offset]
  )

  const totalRow = await one(`SELECT COUNT(*) AS c FROM products p ${where}`, params)
  const total = Number(totalRow?.c || 0)

  res.json({
    items: items.map((r) => ({
      ...r,
      price: Number(r.price),
      avg_rating: Number(r.avg_rating || 0),
      stock: Number(r.stock || 0),
    })),
    total,
    page: pg,
    limit: lim,
    totalPages: Math.ceil(total / lim) || 1,
  })
})

// POST /api/admin/products
router.post('/products', requireAdmin, async (req, res) => {
  const { id, name, description = '', category, gender = 'Chung', price, image_url = '', brand = 'Maison' } = req.body
  if (!name || !name.trim()) return res.status(400).json({ message: 'Tên sản phẩm không được để trống.' })
  if (!category || !category.trim()) return res.status(400).json({ message: 'Danh mục không được để trống.' })
  const numPrice = Number(price)
  if (isNaN(numPrice) || numPrice < 0) return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ.' })

  // Tạo ID nếu chưa có
  const cleanId = (id && id.trim())
    ? id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    : `${category}-${Date.now().toString().slice(-6)}`

  // Kiểm tra trùng ID
  const existing = await one('SELECT id FROM products WHERE id = ?', [cleanId])
  if (existing) return res.status(409).json({ message: `Mã sản phẩm "${cleanId}" đã tồn tại.` })

  const rows = await query(
    `INSERT INTO products (id, name, description, category, gender, brand, price, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING *`,
    [cleanId, name.trim(), description.trim(), category.trim(), gender, brand.trim(), numPrice, image_url.trim()]
  )

  const created = rows[0] || { id: cleanId, name, description, category, gender, brand, price: numPrice, image_url }
  res.status(201).json({ message: 'Thêm sản phẩm thành công!', product: created })

  // Tự động đồng bộ toàn diện sang SQLite, seed-products.json, products.js, ML Service
  syncAllProductData().catch((err) => console.error('[admin/create] Lỗi auto-sync:', err))
})

// PUT /api/admin/products/:id
router.put('/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { name, description = '', category, gender = 'Chung', price, image_url = '', brand = 'Maison' } = req.body
  if (!name || !name.trim()) return res.status(400).json({ message: 'Tên sản phẩm không được để trống.' })
  if (!category || !category.trim()) return res.status(400).json({ message: 'Danh mục không được để trống.' })
  const numPrice = Number(price)
  if (isNaN(numPrice) || numPrice < 0) return res.status(400).json({ message: 'Giá sản phẩm không hợp lệ.' })

  const existing = await one('SELECT id FROM products WHERE id = ?', [id])
  if (!existing) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })

  const rows = await query(
    `UPDATE products
     SET name = ?, description = ?, category = ?, gender = ?, brand = ?, price = ?, image_url = ?
     WHERE id = ?
     RETURNING *`,
    [name.trim(), description.trim(), category.trim(), gender, brand.trim(), numPrice, image_url.trim(), id]
  )

  const updated = rows[0] || { id, name, description, category, gender, brand, price: numPrice, image_url }
  res.json({ message: 'Cập nhật sản phẩm thành công!', product: updated })

  // Tự động đồng bộ toàn diện sang SQLite, seed-products.json, products.js, ML Service
  syncAllProductData().catch((err) => console.error('[admin/update] Lỗi auto-sync:', err))
})

// DELETE /api/admin/products/:id
router.delete('/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const existing = await one('SELECT id FROM products WHERE id = ?', [id])
  if (!existing) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })

  // Dọn dẹp dữ liệu liên kết nếu có
  await query('DELETE FROM interactions WHERE product_id = ?', [id])
  await query('DELETE FROM reviews WHERE product_id = ?', [id])
  await query('DELETE FROM recommendation_log WHERE product_id = ?', [id])
  await query('DELETE FROM products WHERE id = ?', [id])

  res.json({ message: 'Đã xóa sản phẩm thành công!', id })

  // Tự động đồng bộ toàn diện sang SQLite, seed-products.json, products.js, ML Service
  syncAllProductData().catch((err) => console.error('[admin/delete] Lỗi auto-sync:', err))
})

module.exports = router
