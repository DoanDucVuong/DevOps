const express = require('express')
const axios = require('axios')
const { query, one } = require('../db')
const { getMlServiceUrl } = require('../mlConfig')
const { syncAllProductData } = require('../services/syncService')

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
  const prodId = req.params.id
  try {
    const reviews = await query(
      'SELECT id, product_id, user_id, user_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [prodId]
    )
    const stats = await one(
      'SELECT COUNT(*) AS total, AVG(rating) AS avg FROM reviews WHERE product_id = ?',
      [prodId]
    )

    // Lấy các đơn hàng đã thanh toán hoặc hoàn thành để xác thực người mua thật (verified buyer)
    const paidOrders = await query(
      `SELECT user_id, shipping_json, items_json FROM orders WHERE status IN ('completed', 'paid', 'shipped')`
    )

    const enrichedReviews = reviews.map((rev) => {
      let isVerified = false
      for (const order of paidOrders) {
        let hasProduct = false
        try {
          const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || [])
          hasProduct = items.some((it) => String(it.productId || it.id) === String(prodId))
        } catch {}

        if (!hasProduct) continue

        let shippingName = ''
        try {
          const shipping = typeof order.shipping_json === 'string' ? JSON.parse(order.shipping_json) : (order.shipping_json || {})
          shippingName = String(shipping.fullName || '').trim().toLowerCase()
        } catch {}

        const revUserId = rev.user_id ? String(rev.user_id).trim().toLowerCase() : ''
        const revName = rev.user_name ? String(rev.user_name).trim().toLowerCase() : ''
        const orderUserId = order.user_id ? String(order.user_id).trim().toLowerCase() : ''

        if (
          (revUserId && revUserId === orderUserId) ||
          (revName && revName === orderUserId) ||
          (revName && shippingName && revName === shippingName)
        ) {
          isVerified = true
          break
        }
      }

      return {
        ...rev,
        is_verified_buyer: isVerified,
      }
    })

    res.json({
      reviews: enrichedReviews,
      total: Number(stats?.total || 0),
      avgRating: Number(Number(stats?.avg || 0).toFixed(1)),
    })
  } catch (err) {
    console.error('[products/reviews/get] Lỗi:', err)
    res.status(500).json({ message: 'Không thể tải danh sách đánh giá.' })
  }
})

// POST /api/products/:id/reviews
router.post('/:id/reviews', async (req, res) => {
  const prodId = req.params.id
  const { userName, rating, comment, userId } = req.body
  if (!userName || !rating || !comment) {
    return res.status(400).json({ message: 'Vui lòng nhập tên, chọn số sao và nội dung bình luận.' })
  }
  const numRating = Math.max(1, Math.min(5, Number(rating) || 5))
  const cleanUser = String(userName).trim()
  const cleanComment = String(comment).trim()
  const cleanUserId = userId || (req.user?.id ? String(req.user.id) : null)

  try {
    // 1. Lưu bình luận vào bảng reviews (kèm user_id)
    await query(
      'INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [prodId, cleanUserId, cleanUser, numRating, cleanComment]
    )

    // 2. Tính toán lại điểm trung bình từ reviews: SELECT AVG(rating) FROM reviews WHERE product_id = ?
    const stats = await one(
      'SELECT AVG(rating) AS avg, COUNT(*) AS total FROM reviews WHERE product_id = ?',
      [prodId]
    )
    const newAvg = (stats && stats.avg !== null && stats.avg !== undefined)
      ? Number(Number(stats.avg).toFixed(1))
      : numRating

    // 3. Cập nhật avg_rating vào bảng products
    await query('UPDATE products SET avg_rating = ? WHERE id = ?', [newAvg, prodId])

    try {
      await query(
        "INSERT INTO interactions (user_id, product_id, interaction_type, rating_value) VALUES (?, ?, 'rating', ?)",
        [cleanUserId || `guest_${cleanUser.toLowerCase()}`, prodId, numRating]
      )
    } catch {}

    // 4. BẮT BUỘC gọi syncService để đồng bộ số sao mới ra CSDL và các file tĩnh JSON/JS
    await syncAllProductData()

    res.status(201).json({
      message: 'Đánh giá thành công!',
      avgRating: newAvg,
      review: {
        product_id: prodId,
        user_id: cleanUserId,
        user_name: cleanUser,
        rating: numRating,
        comment: cleanComment,
      }
    })
  } catch (err) {
    console.error('[products/reviews/post] Lỗi lưu đánh giá:', err)
    res.status(500).json({ message: 'Không thể lưu đánh giá: ' + err.message })
  }
})

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await one('SELECT * FROM products WHERE id = ?', [req.params.id])
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' })
  res.json(product)
})

module.exports = router
