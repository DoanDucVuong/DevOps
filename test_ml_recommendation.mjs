import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Nạp các thư viện từ backend
const backendRequire = createRequire(path.join(__dirname, 'backend', 'package.json'))
const axios = backendRequire('axios')
const jwt = backendRequire('jsonwebtoken')

// Đọc JWT_SECRET
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
} catch {}

const BASE_URL = 'http://localhost:4000/api'

console.log('=== BẮT ĐẦU KIỂM THỬ TÍCH HỢP HỆ THỐNG GỢI Ý AI (ML SERVICE & PROXY) ===\n')

async function runTests() {
  let passedCount = 0
  const totalTests = 4

  // Token cho user có lịch sử tương tác (User ID = 1)
  const userToken = jwt.sign(
    { id: 1, email: 'admin@sttn.vn', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  )

  // TEST 1: Cold-start / Khách chưa đăng nhập (GET /api/recommendations không kèm token)
  try {
    console.log('[TEST 1] Gọi GET /api/recommendations cho khách chưa đăng nhập (Cold-start -> Popularity)...')
    const res = await axios.get(`${BASE_URL}/recommendations?top_k=8`)

    if (res.status === 200 && Array.isArray(res.data.items) && res.data.items.length > 0) {
      console.log(`✅ PASS [TEST 1]: Nhận ${res.data.items.length} sản phẩm gợi ý Cold-start.`)
      console.log(`   Thuật toán: "${res.data.algorithm}" | Sản phẩm đầu tiên: ${res.data.items[0].name} (${res.data.items[0].id})`)
      passedCount++
    } else {
      console.error('❌ THẤT BẠI [TEST 1]: Dữ liệu không hợp lệ:', res.data)
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 1]:', err.response?.data || err.message)
    process.exit(1)
  }

  // TEST 2: Cá nhân hóa Hybrid / SVD cho User đã đăng nhập (GET /api/recommendations kèm Bearer token)
  try {
    console.log('\n[TEST 2] Gọi GET /api/recommendations kèm Bearer Token (User ID=1 cá nhân hoá)...')
    const res = await axios.get(`${BASE_URL}/recommendations?top_k=8`, {
      headers: { Authorization: `Bearer ${userToken}` },
    })

    if (res.status === 200 && Array.isArray(res.data.items) && res.data.items.length > 0) {
      console.log(`✅ PASS [TEST 2]: Nhận ${res.data.items.length} sản phẩm gợi ý cá nhân hóa cho User ${res.data.user_id}.`)
      console.log(`   Thuật toán: "${res.data.algorithm}" (Hybrid SVD + Content)`)
      console.log(`   Danh sách ID:`, res.data.items.map(p => p.id).join(', '))
      passedCount++
    } else {
      console.error('❌ THẤT BẠI [TEST 2]: Dữ liệu không hợp lệ:', res.data)
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 2]:', err.response?.data || err.message)
    process.exit(1)
  }

  // TEST 3: Gợi ý sản phẩm tương tự Content-based (GET /api/products/:id/similar)
  try {
    console.log('\n[TEST 3] Gọi GET /api/products/p01/similar (Content-based Filtering qua TF-IDF & Cosine)...')
    const res = await axios.get(`${BASE_URL}/products/p01/similar?top_k=4`)

    if (res.status === 200 && Array.isArray(res.data.items) && res.data.items.length > 0) {
      console.log(`✅ PASS [TEST 3]: Nhận ${res.data.items.length} sản phẩm tương tự cho p01.`)
      console.log(`   Thuật toán: "${res.data.algorithm}"`)
      console.log(`   Sản phẩm liên quan:`, res.data.items.map(p => `${p.name} (${p.category})`).join(' | '))
      passedCount++
    } else {
      console.error('❌ THẤT BẠI [TEST 3]: Dữ liệu không hợp lệ:', res.data)
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 3]:', err.response?.data || err.message)
    process.exit(1)
  }

  // TEST 4: Ghi nhận click tracking đo lường CTR (POST /api/recommendations/click)
  try {
    console.log('\n[TEST 4] Gửi POST /api/recommendations/click để ghi nhận tương tác CTR...')
    const res = await axios.post(`${BASE_URL}/recommendations/click`, {
      userId: 1,
      productId: 'p21',
    })

    if (res.status === 200 && res.data.status === 'ok') {
      console.log('✅ PASS [TEST 4]: Ghi nhận click đo CTR thành công.')
      passedCount++
    } else {
      console.error('❌ THẤT BẠI [TEST 4]:', res.data)
      process.exit(1)
    }
  } catch (err) {
    console.error('❌ THẤT BẠI [TEST 4]:', err.response?.data || err.message)
    process.exit(1)
  }

  console.log(`\n🎉 HOÀN TẤT KIỂM THỬ: ${passedCount}/${totalTests} TESTS ĐẠT ĐIỂM TUYỆT ĐỐI!`)
}

runTests().catch((err) => {
  console.error('Lỗi không xác định:', err)
  process.exit(1)
})
