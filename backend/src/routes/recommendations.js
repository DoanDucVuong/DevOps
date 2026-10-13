const express = require('express')
const axios = require('axios')
const { query } = require('../db')
const { getMlServiceUrl } = require('../mlConfig')

const router = express.Router()

// POST /api/recommendations/click  { userId, productId } -> đánh dấu is_clicked (đo CTR)
router.post('/click', async (req, res) => {
  const { userId, productId } = req.body
  if (!userId || !productId) return res.status(400).json({ message: 'Thiếu userId hoặc productId.' })
  await query(
    `UPDATE recommendation_log SET is_clicked = 1
     WHERE id = (
       SELECT id FROM recommendation_log
       WHERE user_id = ? AND product_id = ? AND is_clicked = 0
       ORDER BY created_at DESC, id DESC LIMIT 1
     )`,
    [String(userId), productId]
  )
  res.json({ status: 'ok' })
})

// GET /api/recommendations/:userId -> "Gợi ý dành cho bạn"
router.get('/:userId', async (req, res) => {
  const topK = Number(req.query.top_k) || 8
  const mlUrl = getMlServiceUrl()
  try {
    const { data } = await axios.get(`${mlUrl}/recommendations/${encodeURIComponent(req.params.userId)}`, {
      params: { top_k: topK }, timeout: 10000,
    })
    const ids = data.items.map((i) => i.product_id)
    let items = []
    if (ids.length > 0) {
      const rows = await query(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
      const map = Object.fromEntries(rows.map((r) => [r.id, r]))
      items = ids.map((id) => map[id]).filter(Boolean)
    }
    // Recommendation_Log: mỗi lần hiển thị = 1 impression (phục vụ đo CTR)
    for (const it of items) {
      await query('INSERT INTO recommendation_log (user_id, product_id, algorithm) VALUES (?, ?, ?)',
        [String(req.params.userId), it.id, data.algorithm_used])
    }
    res.json({ items, algorithm: data.algorithm_used })
  } catch (err) {
    console.error('[recommendations] ML service lỗi:', err.message)
    const items = await query('SELECT * FROM products ORDER BY avg_rating DESC LIMIT ?', [topK])
    res.json({ items, algorithm: 'fallback_top_rated' })
  }
})

module.exports = router
