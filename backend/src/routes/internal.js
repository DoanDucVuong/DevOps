const express = require('express')
const { query } = require('../db')

const router = express.Router()
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || ''

// GET /api/internal/export — chỉ dành cho ML service (xác thực bằng khoá nội bộ, không dùng JWT).
// Trả về toàn bộ sản phẩm + lịch sử tương tác thật để huấn luyện lại mô hình.
router.get('/export', async (req, res) => {
  if (!INTERNAL_API_KEY || req.headers['x-internal-key'] !== INTERNAL_API_KEY) {
    return res.status(403).json({ message: 'Forbidden' })
  }
  const products = await query('SELECT id, name, description, category, brand, price FROM products')
  const interactions = await query(
    'SELECT user_id, product_id, interaction_type, rating_value FROM interactions ORDER BY id DESC LIMIT 200000'
  )
  res.json({ products, interactions })
})

module.exports = router
