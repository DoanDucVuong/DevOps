const express = require('express')
const axios = require('axios')
const { query, one } = require('../db')

const router = express.Router()
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001'

const byIds = async (ids) => {
  if (ids.length === 0) return []
  const rows = await query(`SELECT * FROM products WHERE id IN (${ids.map(() => '?').join(',')})`, ids)
  const map = Object.fromEntries(rows.map((r) => [r.id, r]))
  return ids.map((id) => map[id]).filter(Boolean)
}

// GET /api/products?q=&category=&minPrice=&maxPrice=&sort=&page=&limit=
router.get('/', async (req, res) => {
  const { q, category, minPrice, maxPrice, sort, page = 1, limit = 24 } = req.query
  let where = ' WHERE 1=1'
  const params = []
  if (q) { where += ' AND LOWER(name) LIKE LOWER(?)'; params.push(`%${q}%`) }
  if (category) { where += ' AND category = ?'; params.push(category) }
  if (minPrice) { where += ' AND price >= ?'; params.push(Number(minPrice)) }
  if (maxPrice) { where += ' AND price <= ?'; params.push(Number(maxPrice)) }

  const sortMap = { 'price-asc': 'price ASC', 'price-desc': 'price DESC', rating: 'avg_rating DESC' }
  const lim = Math.min(Number(limit) || 24, 100)
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
  try {
    const { data } = await axios.get(`${ML_SERVICE_URL}/products/${req.params.id}/similar`, {
      params: { top_k: topK }, timeout: 5000,
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

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await one('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  res.json(product)
})

module.exports = router
