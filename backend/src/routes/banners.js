const express = require('express')
const { query, one } = require('../db')
const { requireAdmin } = require('../middleware/auth')

const router = express.Router()

// GET /api/banners - Lấy danh sách banner trang chủ đang kích hoạt (public)
router.get('/', async (req, res) => {
  try {
    const banners = await query(
      'SELECT id, title, subtitle, image_url, cta_text, cta_link, sort_order FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id DESC'
    )
    res.json(banners)
  } catch (err) {
    console.error('[banners/list]', err)
    res.status(500).json({ message: 'Lỗi khi tải danh sách banner.' })
  }
})

// GET /api/banners/admin - Lấy toàn bộ banner để quản lý (admin)
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const banners = await query('SELECT * FROM banners ORDER BY sort_order ASC, id DESC')
    res.json(banners)
  } catch (err) {
    console.error('[banners/admin/list]', err)
    res.status(500).json({ message: 'Lỗi khi tải danh sách banner quản trị.' })
  }
})

// POST /api/banners/admin - Tạo banner mới (admin)
router.post('/admin', requireAdmin, async (req, res) => {
  const {
    title,
    subtitle = '',
    image_url,
    cta_text = 'Khám phá ngay',
    cta_link = '/products',
    sort_order = 0,
    is_active = 1
  } = req.body

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Tiêu đề banner không được để trống.' })
  }
  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ message: 'URL hình ảnh banner không được để trống.' })
  }

  try {
    await query(
      `INSERT INTO banners (title, subtitle, image_url, cta_text, cta_link, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), subtitle.trim(), image_url.trim(), cta_text.trim(), cta_link.trim(), Number(sort_order) || 0, is_active ? 1 : 0]
    )

    const created = await one('SELECT * FROM banners ORDER BY id DESC LIMIT 1')
    res.status(201).json(created)
  } catch (err) {
    console.error('[banners/admin/create]', err)
    res.status(500).json({ message: 'Lỗi khi tạo banner mới.' })
  }
})

// PUT /api/banners/admin/:id - Chỉnh sửa banner (admin)
router.put('/admin/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { title, subtitle, image_url, cta_text, cta_link, sort_order, is_active } = req.body

  try {
    const existing = await one('SELECT * FROM banners WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy banner.' })
    }

    const newTitle = title !== undefined ? title.trim() : existing.title
    const newSub = subtitle !== undefined ? subtitle.trim() : existing.subtitle
    const newImg = image_url !== undefined ? image_url.trim() : existing.image_url
    const newCtaText = cta_text !== undefined ? cta_text.trim() : existing.cta_text
    const newCtaLink = cta_link !== undefined ? cta_link.trim() : existing.cta_link
    const newOrder = sort_order !== undefined ? Number(sort_order) : existing.sort_order
    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active

    await query(
      `UPDATE banners
       SET title = ?, subtitle = ?, image_url = ?, cta_text = ?, cta_link = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [newTitle, newSub, newImg, newCtaText, newCtaLink, newOrder, newActive, id]
    )

    const updated = await one('SELECT * FROM banners WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    console.error('[banners/admin/update]', err)
    res.status(500).json({ message: 'Lỗi khi cập nhật banner.' })
  }
})

// DELETE /api/banners/admin/:id - Xoá banner (admin)
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const existing = await one('SELECT id FROM banners WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy banner.' })
    }

    await query('DELETE FROM banners WHERE id = ?', [id])
    res.json({ message: 'Đã xóa banner thành công.', id })
  } catch (err) {
    console.error('[banners/admin/delete]', err)
    res.status(500).json({ message: 'Lỗi khi xóa banner.' })
  }
})

module.exports = router
