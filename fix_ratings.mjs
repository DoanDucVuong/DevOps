import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendRequire = createRequire(path.join(__dirname, 'backend', 'package.json'))
const { query, one, usePg } = backendRequire('./src/db')
const { syncAllProductData } = backendRequire('./src/services/syncService')

console.log('=== BẮT ĐẦU ĐỒNG BỘ ĐIỂM ĐÁNH GIÁ THỰC TẾ (fix_ratings.mjs) ===\n')

async function fixRatings() {
  // 1. Đảm bảo cột review_count tồn tại
  try {
    if (usePg) {
      await query('ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0')
    } else {
      await query('ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0')
    }
    console.log('✅ Đã xác minh cột review_count trong bảng products.')
  } catch (err) {
    // Cột đã tồn tại
  }

  // 2. Reset toàn bộ sản phẩm về 0 sao và 0 lượt đánh giá (xóa sạch dữ liệu ảo 4.2 / 4.5)
  console.log('1. Thực hiện: UPDATE products SET avg_rating = 0, review_count = 0...')
  await query('UPDATE products SET avg_rating = 0, review_count = 0')
  console.log('✅ Đã reset toàn bộ sản phẩm về 0 sao & 0 lượt đánh giá.')

  // 3. Truy vấn các sản phẩm thực sự có đánh giá từ bảng reviews
  console.log('\n2. Quét bảng reviews để tính điểm trung bình thực tế...')
  const stats = await query(
    `SELECT product_id, COUNT(*) AS total_reviews, AVG(rating) AS avg_score
     FROM reviews
     GROUP BY product_id`
  )

  console.log(`📊 Tìm thấy ${stats.length} sản phẩm có đánh giá thực tế trong CSDL:`)

  for (const s of stats) {
    const roundedAvg = Math.round(Number(s.avg_score) * 10) / 10
    const count = Number(s.total_reviews)
    await query(
      'UPDATE products SET avg_rating = ?, review_count = ? WHERE id = ?',
      [roundedAvg, count, s.product_id]
    )
    console.log(`   - Sản phẩm [${s.product_id}]: ${roundedAvg} sao (${count} lượt đánh giá thực tế)`)
  }

  // 4. Đồng bộ toàn bộ dữ liệu ra CSDL PostgreSQL, SQLite và các file tĩnh (seed-products.json, products.js)
  console.log('\n3. Đồng bộ hóa toàn diện ra các file tĩnh & CSDL qua syncService...')
  await syncAllProductData()

  // 5. Kiểm tra kiểm chứng lại
  const zeroReviews = await query('SELECT COUNT(*) AS c FROM products WHERE avg_rating = 0 AND review_count = 0')
  const actualReviews = await query('SELECT COUNT(*) AS c FROM products WHERE avg_rating > 0')

  console.log('\n=== KẾT QUẢ KIỂM TRA SAU KHI ĐỒNG BỘ ===')
  console.log(`✅ Số sản phẩm chưa có đánh giá (chính xác 0 sao): ${zeroReviews[0]?.c || 0} sản phẩm`)
  console.log(`✅ Số sản phẩm có đánh giá thực tế từ reviews: ${actualReviews[0]?.c || 0} sản phẩm`)
  console.log('\n🎉 ĐỒNG BỘ THÀNH CÔNG 100%! Không còn sản phẩm nào bị lỗi 4.2 sao ảo.')
}

fixRatings()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Lỗi thực thi fixRatings:', err)
    process.exit(1)
  })
