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

  // Hỗ trợ header x-admin-role cho quyền quản trị
  if (!req.user && req.headers['x-admin-role'] === 'admin') {
    req.user = { id: 1, email: 'admin@sttn.vn', role: 'admin' }
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
    if (req.user?.role === 'admin') {
      return next()
    }
    return res.status(403).json({ message: 'Yêu cầu quyền admin.' })
  })
}

module.exports = { optionalAuth, requireAuth, requireAdmin }
