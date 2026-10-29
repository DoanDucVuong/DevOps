const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { query, one } = require('../db')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const sign = (user) => jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { fullName, email, password, phone } = req.body
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' })
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Mật khẩu cần tối thiểu 6 ký tự.' })
  }
  const normalizedEmail = String(email).trim().toLowerCase()
  if (await one('SELECT id FROM users WHERE email = ?', [normalizedEmail])) {
    return res.status(409).json({ message: 'Email này đã được đăng ký.' })
  }
  const rows = await query(
    'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?) RETURNING id',
    [fullName, normalizedEmail, bcrypt.hashSync(password, 10), phone || null]
  )
  const user = { id: rows[0].id, fullName, email: normalizedEmail, role: 'user' }
  res.status(201).json({ token: sign(user), user })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const row = await one('SELECT * FROM users WHERE email = ?', [String(email || '').trim().toLowerCase()])
  if (!row || !bcrypt.compareSync(String(password || ''), row.password)) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
  }
  const user = {
    id: row.id,
    fullName: row.full_name,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    role: row.role
  }
  res.json({ token: sign(user), user })
})

const { requireAuth } = require('../middleware/auth')

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const row = await one('SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE id = ?', [req.user.id])
  if (!row) return res.status(404).json({ message: 'Không tìm thấy người dùng' })
  res.json({
    id: row.id,
    fullName: row.full_name,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    role: row.role,
    createdAt: row.created_at
  })
})

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req, res) => {
  const { fullName, phone, address } = req.body
  await query(
    'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?',
    [fullName || null, phone || null, address || null, req.user.id]
  )
  const row = await one('SELECT id, full_name, email, phone, address, role FROM users WHERE id = ?', [req.user.id])
  res.json({
    user: {
      id: row.id,
      fullName: row.full_name,
      name: row.full_name,
      email: row.email,
      phone: row.phone,
      address: row.address,
      role: row.role
    }
  })
})

module.exports = router
