const express = require('express')
const axios = require('axios')
const { query, one } = require('../db')
const { requireAdmin } = require('../middleware/auth')
const { parseOrder } = require('./orders')
const { getMlServiceUrl } = require('../mlConfig')

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
  try {
    const { data } = await axios.get(`${mlUrl}/health`, { timeout: 35000 })
    res.json(data)
  } catch (err) {
    console.error(`[admin/ml/status] Lỗi kết nối tới ML (${mlUrl}):`, err.message)
    res.status(502).json({ message: 'Không kết nối được ML service.', detail: err.message, mlUrl })
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

module.exports = router
