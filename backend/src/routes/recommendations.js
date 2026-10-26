const express = require('express')
const axios = require('axios')
const { query } = require('../db')
const { getMlServiceUrl } = require('../mlConfig')
const { optionalAuth } = require('../middleware/auth')

const router = express.Router()

// Helper: Query chi tiết các sản phẩm từ Database theo danh sách ID đúng thứ tự xếp hạng của ML
const byIds = async (ids) => {
  if (!ids || ids.length === 0) return []
  const rows = await query(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
  const map = Object.fromEntries(rows.map((r) => [r.id, r]))
  return ids.map((id) => map[id]).filter(Boolean)
}

// Helper: Fallback lấy các sản phẩm đánh giá cao nhất trực tiếp từ DB nếu cả ML service gặp sự cố
const fallbackPopularFromDb = async (topK) => {
  return await query('SELECT * FROM products ORDER BY avg_rating DESC, price DESC LIMIT ?', [topK])
}

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

// Xử lý cốt lõi luồng gợi ý: Ưu tiên Hybrid cá nhân hóa -> Fallback sang Popularity Cold-start -> Fallback DB
async function handleRecommendations(req, res, targetUserId) {
  const topK = Math.min(Number(req.query.top_k) || 8, 50)
  const mlUrl = getMlServiceUrl()
  const userId = targetUserId || req.user?.id || req.query.user_id || req.query.userId || null

  // 1. Nếu có User ID: Thử gọi sang Python ML service recommendations/{user_id} (Hybrid SVD + Content-based)
  if (userId) {
    try {
      const { data } = await axios.get(`${mlUrl}/recommendations/${encodeURIComponent(userId)}`, {
        params: { top_k: topK },
        timeout: 10000,
      })
      const ids = (data.items || []).map((i) => i.product_id)
      const items = await byIds(ids)

      // Ghi nhận impression để đo lường CTR
      for (const it of items) {
        query('INSERT INTO recommendation_log (user_id, product_id, algorithm) VALUES (?, ?, ?)',
          [String(userId), it.id, data.algorithm_used || 'hybrid']).catch(() => {})
      }

      return res.json({
        items,
        algorithm: data.algorithm_used || 'hybrid',
        user_id: String(userId),
      })
    } catch (err) {
      console.warn(`[recommendations] Không thể lấy gợi ý riêng cho user ${userId} (${err.message}). Kích hoạt Cold-start...`)
    }
  }

  // 2. Bài toán Cold-start: Khách chưa đăng nhập hoặc User mới chưa có tương tác -> Gọi sang http://localhost:8001/popular?top_k=8
  try {
    const { data } = await axios.get(`${mlUrl}/popular`, {
      params: { top_k: topK },
      timeout: 10000,
    })
    const ids = (data.items || []).map((i) => i.product_id)
    const items = await byIds(ids)

    // Ghi log impressions (đo CTR guest)
    const logUser = userId ? String(userId) : 'guest'
    for (const it of items) {
      query('INSERT INTO recommendation_log (user_id, product_id, algorithm) VALUES (?, ?, ?)',
        [logUser, it.id, data.algorithm_used || 'popularity']).catch(() => {})
    }

    return res.json({
      items,
      algorithm: data.algorithm_used || 'popularity',
      user_id: userId ? String(userId) : null,
    })
  } catch (err) {
    console.error('[recommendations] Python ML Service lỗi:', err.message)
    // 3. Fallback an toàn từ Database nếu Python service đang khởi động / offline
    const items = await fallbackPopularFromDb(topK)
    return res.json({
      items,
      algorithm: 'fallback_top_rated',
      user_id: userId ? String(userId) : null,
    })
  }
}

// GET /api/recommendations: Tự động trích xuất token người dùng (nếu có)
router.get('/', optionalAuth, async (req, res) => {
  await handleRecommendations(req, res, null)
})

// GET /api/recommendations/:userId
router.get('/:userId', optionalAuth, async (req, res) => {
  await handleRecommendations(req, res, req.params.userId)
})

module.exports = router
