require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express()
const corsOrigin = process.env.CORS_ORIGIN
const originConfig = (!corsOrigin || corsOrigin === '*') ? true : corsOrigin.split(',').map((s) => s.trim())
app.use(cors({ origin: originConfig }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'backend', database: db.usePg ? 'postgresql' : 'sqlite' }))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/vouchers', require('./routes/vouchers'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/interactions', require('./routes/interactions'))
app.use('/api/recommendations', require('./routes/recommendations'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/reviews', (req, res, next) => {
  const prodId = req.body?.product_id || req.body?.productId
  if (req.method === 'POST' && prodId) {
    req.url = `/${prodId}/reviews`
    return require('./routes/products')(req, res, next)
  }
  next()
})
app.use('/api/admin', require('./routes/admin'))
app.use('/api/internal', require('./routes/internal'))

app.use((req, res) => res.status(404).json({ message: 'Không tìm thấy endpoint.' }))
// Express 5 tự chuyển lỗi của handler async vào đây
app.use((err, req, res, next) => {
  console.error('[error]', err)
  res.status(500).json({ message: 'Lỗi máy chủ.' })
})

const PORT = process.env.PORT || 4000
db.init()
  .then(() => app.listen(PORT, () => {
    console.log(`Backend Service đang chạy tại http://localhost:${PORT}`)
    const { getMlServiceUrl } = require('./mlConfig')
    console.log(`ML_SERVICE_URL = ${getMlServiceUrl()}`)
  }))
  .catch((err) => { console.error('Không khởi tạo được database:', err); process.exit(1) })
