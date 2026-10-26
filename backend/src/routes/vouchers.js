const express = require('express')
const { query, one } = require('../db')
const { requireAuth, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// POST /api/vouchers/apply - Kiểm tra và áp dụng mã giảm giá (yêu cầu đăng nhập JWT)
router.post('/apply', requireAuth, async (req, res) => {
  const { code, order_total = 0, orderTotal = 0, total = 0 } = req.body
  const rawTotal = Number(order_total || orderTotal || total) || 0

  if (!code || !String(code).trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá.' })
  }

  const cleanCode = String(code).trim().toUpperCase()

  try {
    const voucher = await one('SELECT * FROM vouchers WHERE UPPER(code) = ? AND is_active = 1', [cleanCode])
    if (!voucher) {
      return res.status(404).json({ message: 'Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa.' })
    }

    // 1. Kiểm tra lượt dùng
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết lượt sử dụng.' })
    }

    // 2. Kiểm tra hạn sử dụng
    if (voucher.expires_at) {
      const expDate = new Date(voucher.expires_at)
      if (expDate < new Date()) {
        return res.status(400).json({ message: 'Mã giảm giá đã quá hạn sử dụng.' })
      }
    }

    // 3. Kiểm tra giá trị đơn hàng tối thiểu
    if (voucher.min_order_value && rawTotal < Number(voucher.min_order_value)) {
      return res.status(400).json({
        message: `Mã này chỉ áp dụng cho đơn hàng từ ${Number(voucher.min_order_value).toLocaleString('vi-VN')} đ trở lên.`
      })
    }

    // 4. Tính toán số tiền giảm
    let discountAmount = 0
    if (voucher.discount_type === 'percent') {
      discountAmount = Math.round((rawTotal * Number(voucher.discount_value)) / 100)
      if (voucher.max_discount && discountAmount > Number(voucher.max_discount)) {
        discountAmount = Number(voucher.max_discount)
      }
    } else {
      // Giảm theo số tiền cố định
      discountAmount = Number(voucher.discount_value)
    }

    if (discountAmount > rawTotal) {
      discountAmount = rawTotal
    }

    const finalTotal = Math.max(0, rawTotal - discountAmount)

    res.json({
      success: true,
      valid: true,
      code: voucher.code,
      discount_amount: discountAmount,
      final_total: finalTotal,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discount_type: voucher.discount_type,
        discount_value: Number(voucher.discount_value),
        min_order_value: Number(voucher.min_order_value || 0),
        max_discount: voucher.max_discount ? Number(voucher.max_discount) : null,
      }
    })
  } catch (err) {
    console.error('[vouchers/apply]', err)
    res.status(500).json({ message: 'Lỗi kiểm tra mã giảm giá: ' + err.message })
  }
})

// GET /api/vouchers/admin - Lấy danh sách tất cả voucher (admin)
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const list = await query('SELECT * FROM vouchers ORDER BY id DESC')
    res.json(list)
  } catch (err) {
    console.error('[vouchers/admin/list]', err)
    res.status(500).json({ message: 'Lỗi khi tải danh sách voucher.' })
  }
})

// POST /api/vouchers/admin - Tạo voucher mới (admin)
router.post('/admin', requireAdmin, async (req, res) => {
  const {
    code,
    discount_type = 'percent',
    discount_value,
    min_order_value = 0,
    max_discount,
    usage_limit = 100,
    expires_at,
    is_active = 1
  } = req.body

  if (!code || !code.trim()) {
    return res.status(400).json({ message: 'Mã giảm giá không được để trống.' })
  }
  if (!discount_value || Number(discount_value) <= 0) {
    return res.status(400).json({ message: 'Giá trị giảm giá phải lớn hơn 0.' })
  }

  const cleanCode = code.trim().toUpperCase()

  try {
    const existing = await one('SELECT id FROM vouchers WHERE UPPER(code) = ?', [cleanCode])
    if (existing) {
      return res.status(400).json({ message: 'Mã giảm giá này đã tồn tại trong hệ thống.' })
    }

    await query(
      `INSERT INTO vouchers (
        code, discount_type, discount_value, min_order_value, max_discount,
        usage_limit, used_count, is_active, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        cleanCode,
        discount_type,
        Number(discount_value),
        Number(min_order_value) || 0,
        max_discount ? Number(max_discount) : null,
        Number(usage_limit) || 100,
        is_active ? 1 : 0,
        expires_at || null
      ]
    )

    const created = await one('SELECT * FROM vouchers WHERE UPPER(code) = ?', [cleanCode])
    res.status(201).json(created)
  } catch (err) {
    console.error('[vouchers/admin/create]', err)
    res.status(500).json({ message: 'Lỗi khi tạo mã voucher.' })
  }
})

// PUT /api/vouchers/admin/:id - Chỉnh sửa voucher (admin)
router.put('/admin/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const {
    code,
    discount_type,
    discount_value,
    min_order_value,
    max_discount,
    usage_limit,
    is_active,
    expires_at
  } = req.body

  try {
    const existing = await one('SELECT * FROM vouchers WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy mã voucher.' })
    }

    const cleanCode = code ? code.trim().toUpperCase() : existing.code
    const newType = discount_type || existing.discount_type
    const newVal = discount_value !== undefined ? Number(discount_value) : existing.discount_value
    const newMin = min_order_value !== undefined ? Number(min_order_value) : existing.min_order_value
    const newMax = max_discount !== undefined ? (max_discount ? Number(max_discount) : null) : existing.max_discount
    const newLimit = usage_limit !== undefined ? Number(usage_limit) : existing.usage_limit
    const newActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active
    const newExp = expires_at !== undefined ? expires_at : existing.expires_at

    await query(
      `UPDATE vouchers
       SET code = ?, discount_type = ?, discount_value = ?, min_order_value = ?,
           max_discount = ?, usage_limit = ?, is_active = ?, expires_at = ?
       WHERE id = ?`,
      [cleanCode, newType, newVal, newMin, newMax, newLimit, newActive, newExp, id]
    )

    const updated = await one('SELECT * FROM vouchers WHERE id = ?', [id])
    res.json(updated)
  } catch (err) {
    console.error('[vouchers/admin/update]', err)
    res.status(500).json({ message: 'Lỗi khi cập nhật mã voucher.' })
  }
})

// DELETE /api/vouchers/admin/:id - Xoá voucher (admin)
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  try {
    const existing = await one('SELECT id FROM vouchers WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy voucher.' })
    }

    await query('DELETE FROM vouchers WHERE id = ?', [id])
    res.json({ message: 'Đã xóa mã voucher thành công.', id })
  } catch (err) {
    console.error('[vouchers/admin/delete]', err)
    res.status(500).json({ message: 'Lỗi khi xóa mã voucher.' })
  }
})

module.exports = router
