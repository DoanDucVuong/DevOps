const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

function optionalAuth(req, res, next) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET)
    } catch {
      req.user = null
    }
  }

  // Hỗ trợ môi trường dev / local hoặc khi có header x-admin-role
  if (!req.user) {
    const isLocal = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.hostname === 'localhost'
    if (isLocal || req.headers['x-admin-role'] === 'admin') {
      req.user = { id: 1, email: 'admin@sttn.vn', role: 'admin' }
    }
  }
  next()
}

function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ message: 'Yêu cầu đăng nhập.' })
    next()
  })
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user?.role === 'admin' || req.headers['x-admin-role'] === 'admin') {
      return next()
    }
    return res.status(403).json({ message: 'Yêu cầu quyền admin.' })
  })
}

module.exports = { optionalAuth, requireAuth, requireAdmin }
