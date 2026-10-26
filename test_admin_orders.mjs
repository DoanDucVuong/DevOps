import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Sử dụng require từ backend để nạp các thư viện đã cài đặt
const backendRequire = createRequire(path.join(__dirname, 'backend', 'package.json'))
const jwt = backendRequire('jsonwebtoken')
const axios = backendRequire('axios')
const Database = backendRequire('better-sqlite3')

// Đọc file .env của backend
let JWT_SECRET = 'dev-secret-change-in-production'
try {
  const envContent = fs.readFileSync(path.join(__dirname, 'backend', '.env'), 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('JWT_SECRET=')) {
      JWT_SECRET = trimmed.slice('JWT_SECRET='.length).trim()
      break
    }
  }
} catch {
  // fallback
}

const BASE_URL = 'http://localhost:4000/api'

console.log('=== BẮT ĐẦU KIỂM THỬ QUẢN LÝ ĐƠN HÀNG ADMIN (Orders Management) ===\n')

async function runTests() {
  let passedCount = 0
  let totalTests = 5

  // Tạo JWT Token giả lập
  const adminToken = jwt.sign(
    { id: 1, email: 'admin@sttn.vn', full_name: 'Quản trị viên', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )

  const userToken = jwt.sign(
    { id: 7, email: 'customer@gmail.com', full_name: 'Khách hàng', role: 'user' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )

  // TEST 1: Chặn người dùng thường (role === 'user') truy cập API Admin (Bắt buộc 403 Forbidden)
  try {
    console.log('[TEST 1] Thử đổi trạng thái đơn hàng ID=6 bằng tài khoản User (role=user)...')
    await axios.patch(
      `${BASE_URL}/admin/orders/6/status`,
      { status: 'shipped' },
      { headers: { Authorization: `Bearer ${userToken}` } }
    )
    console.error('❌ THẤT BẠI: User thường không bị chặn 403!')
    process.exit(1)
  } catch (err) {
    if (err.response?.status === 403) {
      console.log('✅ PASS [TEST 1]: Hệ thống chặn 403 Forbidden chính xác đối với non-admin user.')
      passedCount++
    } else {
      console.error(`❌ THẤT BẠI [TEST 1]: Mong đợi 403 nhưng nhận mã ${err.response?.status || err.message}`)
      process.exit(1)
    }
  }

  // TEST 2: Chặn trạng thái không hợp lệ (Bắt buộc 400 Bad Request)
  try {
    console.log('\n[TEST 2] Thử cập nhật trạng thái không hợp lệ "flying" bằng Admin token...')
    await axios.patch(
      `${BASE_URL}/admin/orders/6/status`,
      { status: 'flying' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    console.error('❌ THẤT BẠI: Hệ thống chấp nhận trạng thái không hợp lệ!')
    process.exit(1)
  } catch (err) {
    if (err.response?.status === 400) {
      console.log('✅ PASS [TEST 2]: Hệ thống từ chối trạng thái không hợp lệ với mã 400.')
      passedCount++
    } else {
      console.error(`❌ THẤT BẠI [TEST 2]: Mong đợi 400 nhưng nhận mã ${err.response?.status || err.message}`)
      process.exit(1)
    }
  }

  // TEST 3: Đổi trạng thái đơn hàng ID=6 sang 'shipped' bằng Admin token
  try {
    console.log('\n[TEST 3] Admin gửi PATCH /api/admin/orders/6/status với { status: "shipped" }...')
    const res = await axios.patch(
      `${BASE_URL}/admin/orders/6/status`,
      { status: 'shipped' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )

    if (res.status === 200 && res.data?.status === 'shipped') {
      console.log('✅ PASS [TEST 3]: API trả về 200 OK và status = "shipped":', res.data)
      passedCount++
    } else {
      console.error('❌ THẤT BẠI [TEST 3]: Dữ liệu trả về không đúng:', res.data)
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 3]:', err.response?.data || err.message)
    process.exit(1)
  }

  // TEST 4: Kiểm tra GET /api/admin/orders
  try {
    console.log('\n[TEST 4] Admin gọi GET /api/admin/orders để kiểm tra danh sách đơn hàng...')
    const res = await axios.get(`${BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })

    const order6 = res.data?.find((o) => o.id === 6 || o.numericId === 6 || o.code === 'ORD-000006' || String(o.id).includes('6'))
    if (order6 && order6.status === 'shipped') {
      console.log(`✅ PASS [TEST 4]: Đơn hàng ID=6 đã chuyển thành công sang status="shipped" trong danh sách orders (Mã đơn: ${order6.code || order6.id}).`)
      passedCount++
    } else {
      console.log('Dữ liệu các đơn hàng hiện có:', res.data?.map(o => ({ id: o.id, code: o.code, status: o.status })))
      console.error('❌ THẤT BẠI [TEST 4]: Không tìm thấy đơn hàng ID=6 với status=shipped!')
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 4]:', err.response?.data || err.message)
    process.exit(1)
  }

  // TEST 5: Kiểm tra trực tiếp Database SQLite để xác minh tính toàn vẹn dữ liệu
  try {
    console.log('\n[TEST 5] Kiểm tra trực tiếp Database SQLite (sttn.db)...')
    const dbPath = path.join(__dirname, 'backend', 'src', 'db', 'sttn.db')
    const db = new Database(dbPath)
    const row = db.prepare('SELECT id, status, total_amount FROM orders WHERE id = 6').get()

    if (row && row.status === 'shipped') {
      console.log(`✅ PASS [TEST 5]: SQLite xác nhận lưu trữ bền vững: Order ID=${row.id}, status="${row.status}", total_amount=${row.total_amount}`)
      passedCount++
    } else {
      console.error('❌ THẤT BẠI [TEST 5]: Bản ghi trong SQLite không khớp:', row)
      process.exit(1)
    }
    db.close()
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 5]: Lỗi đọc SQLite:', err.message)
    process.exit(1)
  }

  console.log(`\n🎉 HOÀN TẤT KIỂM THỬ: ${passedCount}/${totalTests} TESTS ĐẠT LOẠI XUẤT SẮC!`)
}

runTests().catch((err) => {
  console.error('Lỗi không xử lý được:', err)
  process.exit(1)
})
