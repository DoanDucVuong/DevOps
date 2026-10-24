const express = require('express')
const { query, one } = require('../db')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/categories - Lấy danh sách danh mục đang kích hoạt (public)
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      'SELECT id, name, slug, gender_group, sort_order, is_active FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    )
    res.json(rows)
  } catch (err) {
    console.error('[categories/list]', err)
    res.status(500).json({ message: 'Lỗi khi tải danh mục.' })
  }
})

// GET /api/categories/admin - Lấy toàn bộ danh mục kèm số lượng sản phẩm (admin)
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC')
    const counts = await query('SELECT category, COUNT(*) as count FROM products GROUP BY category')
    const countMap = new Map(counts.map(c => [c.category, Number(c.count)]))

    const result = categories.map(cat => ({
      ...cat,
      product_count: countMap.get(cat.id) || countMap.get(cat.slug) || 0
    }))
    res.json(result)
  } catch (err) {
    console.error('[categories/admin/list]', err)
    res.status(500).json({ message: 'Lỗi khi tải danh mục quản trị.' })
  }
})

// POST /api/categories/admin - Thêm danh mục mới (admin)
router.post('/admin', requireAdmin, async (req, res) => {
  const { name, slug, gender_group = 'Chung', sort_order = 0, is_active = 1 } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Tên danh mục không được để trống.' })
  }

  // Tự sinh slug nếu không truyền
  const cleanSlug = (slug || name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const id = cleanSlug

  try {
    const existing = await one('SELECT id FROM categories WHERE id = ? OR slug = ?', [id, cleanSlug])
    if (existing) {
      return res.status(400).json({ message: 'Mã hoặc đường dẫn (slug) danh mục đã tồn tại.' })
    }

    await query(
      `INSERT INTO categories (id, name, slug, gender_group, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), cleanSlug, gender_group, Number(sort_order) || 0, is_active ? 1 : 0]
    )

    const created = await one('SELECT * FROM categories WHERE id = ?', [id])
    res.status(201).json(created)
  } catch (err) {
    console.error('[categories/admin/create]', err)
    res.status(500).json({ message: 'Lỗi khi tạo danh mục mới.' })
  }
})

// PUT /api/categories/admin/:id - Chỉnh sửa danh mục (admin)
router.put('/admin/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { name, slug, gender_group, sort_order, is_active } = req.body

  try {
    const existing = await one('SELECT * FROM categories WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục.' })
    }

    const newName = name !== undefined ? name.trim() : existing.name
    const newSlug = slug !== undefined ? slug.trim() : existing.slug
    const newGender = gender_group !== undefined ? gender_group : existing.gender_group
    const newOrder = sort_order !== undefined ? Number(sort_order) : existing.sort_order
    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active

    await query(
      `UPDATE categories
       SET name = ?, slug = ?, gender_group = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [newName, newSlug, newGender, newOrder, newActive, id]
    )

    const updated = await one('SELECT * FROM categories WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    console.error('[categories/admin/update]', err)
    res.status(500).json({ message: 'Lỗi khi cập nhật danh mục.' })
  }
})

// DELETE /api/categories/admin/:id - Xoá danh mục (admin)
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const existing = await one('SELECT * FROM categories WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục.' })
    }

    // Kiểm tra xem có sản phẩm nào đang thuộc danh mục này không
    const prodCount = Number((await one('SELECT COUNT(*) AS c FROM products WHERE category = ?', [id])).c)
    if (prodCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa danh mục này vì đang có ${prodCount} sản phẩm liên kết. Bạn có thể chọn 'Ẩn danh mục' thay vì xóa.`
      })
    }

    await query('DELETE FROM categories WHERE id = ?', [id])
    res.json({ message: 'Đã xóa danh mục thành công.', id })
  } catch (err) {
    console.error('[categories/admin/delete]', err)
    res.status(500).json({ message: 'Lỗi khi xóa danh mục.' })
  }
})

module.exports = router
