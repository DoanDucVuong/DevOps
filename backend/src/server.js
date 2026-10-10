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
app.use('/api/interactions', require('./routes/interactions'))
app.use('/api/recommendations', require('./routes/recommendations'))
app.use('/api/orders', require('./routes/orders'))
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
    console.log(`ML_SERVICE_URL = ${process.env.ML_SERVICE_URL || 'http://localhost:8001'}`)
  }))
  .catch((err) => { console.error('Không khởi tạo được database:', err); process.exit(1) })
