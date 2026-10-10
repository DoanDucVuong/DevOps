const express = require('express')
const { query, one } = require('../db')
const { optionalAuth } = require('../middleware/auth')

const router = express.Router()

// POST /api/interactions  { productId, type: 'view'|'cart'|'purchase'|'rating', ratingValue? }
// Nguồn dữ liệu huấn luyện thật cho ML (bảng interactions).
router.post('/', optionalAuth, async (req, res) => {
  const { productId, type, ratingValue } = req.body
  if (!productId || !['view', 'cart', 'purchase', 'rating'].includes(type)) {
    return res.status(400).json({ message: 'productId hoặc type không hợp lệ.' })
  }
  if (type === 'rating' && !(Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 5)) {
    return res.status(400).json({ message: 'ratingValue phải là số nguyên từ 1 đến 5.' })
  }
  if (!(await one('SELECT id FROM products WHERE id = ?', [productId]))) {
    return res.status(404).json({ message: 'Sản phẩm không tồn tại.' })
  }
  // Guest chưa đăng nhập: user_id = null (vẫn dùng được cho Popularity)
  const userId = req.user ? String(req.user.id) : null
  await query(
    'INSERT INTO interactions (user_id, product_id, interaction_type, rating_value) VALUES (?, ?, ?, ?)',
    [userId, productId, type, type === 'rating' ? ratingValue : null]
  )
  if (type === 'rating') {
    const row = await one(
      "SELECT AVG(rating_value) AS avg_value FROM interactions WHERE product_id = ? AND interaction_type = 'rating'",
      [productId]
    )
    await query('UPDATE products SET avg_rating = ? WHERE id = ?', [+Number(row.avg_value).toFixed(1), productId])
  }
  res.status(201).json({ status: 'recorded' })
})

module.exports = router
