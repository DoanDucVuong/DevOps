const express = require('express')
const axios = require('axios')
const { query, one } = require('../db')
const { getMlServiceUrl } = require('../mlConfig')

const router = express.Router()

const byIds = async (ids) => {
  if (ids.length === 0) return []
  const rows = await query(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
  const map = Object.fromEntries(rows.map((r) => [r.id, r]))
  return ids.map((id) => map[id]).filter(Boolean)
}

// GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res) => {
  const { q, category, gender, minPrice, maxPrice, sort, page = 1, limit = 24 } = req.query
  let where = ' WHERE 1=1'
  const params = []
  if (q) { where += ' AND LOWER(name) LIKE LOWER(?)'; params.push(`%${q}%`) }
  if (category) { where += ' AND category = ?'; params.push(category) }
  if (gender) { where += ' AND gender = ?'; params.push(gender) }
  if (minPrice) { where += ' AND price >= ?'; params.push(Number(minPrice)) }
  if (maxPrice) { where += ' AND price <= ?'; params.push(Number(maxPrice)) }

  const sortMap = { 'price-asc': 'price ASC', 'price-desc': 'price DESC', rating: 'avg_rating DESC' }
  const lim = Math.min(Number(limit) || 24, 500)
  const offset = (Math.max(Number(page) || 1, 1) - 1) * lim

  const items = await query(
    `SELECT * FROM products${where} ORDER BY ${sortMap[sort] || 'created_at DESC'} LIMIT ? OFFSET ?`,
    [...params, lim, offset]
  )
  const total = Number((await one(`SELECT COUNT(*) AS c FROM products${where}`, params)).c)
  res.json({ items, total, page: Number(page), limit: lim })
})

// GET /api/products/:id/similar -> Content-based Filtering từ ML Service
router.get('/:id/similar', async (req, res) => {
  const topK = Number(req.query.top_k) || 4
  const mlUrl = getMlServiceUrl()
  try {
    const { data } = await axios.get(`${mlUrl}/products/${req.params.id}/similar`, {
      params: { top_k: topK }, timeout: 10000,
    })
    const items = await byIds(data.items.map((i) => i.product_id))
    res.json({ items, algorithm: data.algorithm_used })
  } catch (err) {
    console.error('[products/similar] ML service lỗi:', err.message)
    const product = await one('SELECT category FROM products WHERE id = ?', [req.params.id])
    const items = product
      ? await query('SELECT * FROM products WHERE category = ? AND id != ? LIMIT ?', [product.category, req.params.id, topK])
      : []
    res.json({ items, algorithm: 'fallback_same_category' })
  }
})

// GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await query(
      'SELECT id, product_id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [req.params.id]
    )
    const stats = await one(
      'SELECT COUNT(*) AS total, AVG(rating) AS avg FROM reviews WHERE product_id = ?',
      [req.params.id]
    )
    res.json({
      reviews,
      total: Number(stats?.total || 0),
      avgRating: Number(Number(stats?.avg || 0).toFixed(1)),
    })
  } catch (err) {
    res.status(500).json({ message: 'Không thể tải danh sách đánh giá.' })
  }
})

// POST /api/products/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  const { userName, rating, comment, userId } = req.body
  if (!userName || !rating || !comment) {
    return res.status(400).json({ message: 'Vui lòng nhập tên, chọn số sao và nội dung bình luận.' })
  }
  const numRating = Math.max(1, Math.min(5, Number(rating) || 5))

  try {
    await query(
      'INSERT INTO reviews (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)',
      [req.params.id, String(userName).trim(), numRating, String(comment).trim()]
    )

    const stats = await one(
      'SELECT AVG(rating) AS avg FROM reviews WHERE product_id = ?',
      [req.params.id]
    )
    const newAvg = Number(Number(stats?.avg || numRating).toFixed(1))
    await query('UPDATE products SET avg_rating = ? WHERE id = ?', [newAvg, req.params.id])

    try {
      await query(
        "INSERT INTO interactions (user_id, product_id, interaction_type, rating_value) VALUES (?, ?, 'rating', ?)",
        [userId || `guest_${String(userName).trim().toLowerCase()}`, req.params.id, numRating]
      )
    } catch {}

    res.status(201).json({ message: 'Đánh giá thành công!', avgRating: newAvg })
  } catch (err) {
    res.status(500).json({ message: 'Không thể lưu đánh giá.' })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await one('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  res.json(product)
})

module.exports = router
