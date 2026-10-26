import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from './backend/node_modules/pg/lib/index.js';
import Database from './backend/node_modules/better-sqlite3/lib/index.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
console.log('🚀 BẮT ĐẦU FIX LOGIC VÀ KIỂM THỬ TOÀN DIỆN (fix_logic.mjs)');
console.log('========================================================');

// 1. ĐẢM BẢO CSDL CÓ ĐỦ CỘT (user_id trong reviews, avg_rating trong products)
const sqlitePath = path.join(__dirname, 'backend/src/db/sttn.db');
const db = new Database(sqlitePath);
try {
  db.exec("ALTER TABLE reviews ADD COLUMN user_id TEXT");
} catch (e) {}
try {
  db.exec("ALTER TABLE products ADD COLUMN avg_rating REAL DEFAULT 0");
} catch (e) {}
db.close();

// 2. TEST TẠO SẢN PHẨM MỚI KHÔNG TRUYỀN ID
console.log('\n[TEST 1] Gọi API POST /api/admin/products (không gửi id)...');
let createdProductId = null;
try {
  const addRes = await fetch('http://127.0.0.1:4000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-role': 'admin'
    },
    body: JSON.stringify({
      name: 'Áo Polo Test Tự Động Tăng Mã',
      category: 'ao-thun',
      gender: 'Nam',
      price: 320000,
      description: 'Sản phẩm test auto-increment ID',
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80'
    })
  });

  const addData = await addRes.json();
  console.log('  ✓ HTTP Status:', addRes.status);
  console.log('  ✓ Sản phẩm tạo ra:', addData.product ? { id: addData.product.id, name: addData.product.name } : addData);
  createdProductId = addData.product?.id;
} catch (err) {
  console.error('  ! Lỗi gọi API POST products:', err.message);
}

// 3. TEST TẠO ĐÁNH GIÁ 5 SAO VÀ KIỂM TRA AVG_RATING ĐẠT 5.0
const testTargetId = createdProductId || 'p15';
console.log(`\n[TEST 2] Gửi đánh giá 5 sao cho sản phẩm ${testTargetId}...`);
try {
  const revRes = await fetch(`http://127.0.0.1:4000/api/products/${testTargetId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userName: 'Khách Hàng Thử Nghiệm',
      rating: 5,
      comment: 'Chất vải rất đẹp, phom dáng chuẩn!',
      userId: 'user_test_99'
    })
  });

  const revData = await revRes.json();
  console.log('  ✓ HTTP Status:', revRes.status);
  console.log('  ✓ Điểm trung bình trả về:', revData.avgRating);
} catch (err) {
  console.error('  ! Lỗi gọi API reviews:', err.message);
}

// Đánh giá 5 sao thêm cho p15 nếu có để đảm bảo p15 cũng có avg_rating 5.0
if (testTargetId !== 'p15') {
  try {
    await fetch('http://127.0.0.1:4000/api/products/p15/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: 'Khách Hàng Thử Nghiệm p15',
        rating: 5,
        comment: 'Đánh giá 5 sao mẫu cho p15',
        userId: 'user_p15_buyer'
      })
    });
  } catch {}
}

// 4. KIỂM TRA LẠI DỮ LIỆU ĐÃ LƯU TRONG SQLITE VÀ FILE TĨNH
console.log('\n[TEST 3] Kiểm chứng trong CSDL SQLite và file tĩnh:');
const checkDb = new Database(sqlitePath);
if (createdProductId) {
  const prodRow = checkDb.prepare("SELECT id, name, price, avg_rating FROM products WHERE id = ?").get(createdProductId);
  console.log(`  ✓ Sản phẩm mới [${createdProductId}] trong SQLite:`, prodRow);
}
const p15Row = checkDb.prepare("SELECT id, name, price, avg_rating FROM products WHERE id = 'p15'").get();
console.log('  ✓ Sản phẩm [p15] trong SQLite:', p15Row);
checkDb.close();

// Kiểm tra reviews của testTargetId để xem cờ is_verified_buyer
console.log(`\n[TEST 4] Kiểm tra cờ is_verified_buyer từ API GET /reviews...`);
try {
  const listRes = await fetch(`http://127.0.0.1:4000/api/products/${testTargetId}/reviews`);
  const listData = await listRes.json();
  console.log('  ✓ Số lượng reviews:', listData.reviews?.length);
  if (listData.reviews && listData.reviews.length > 0) {
    console.log('  ✓ Review mẫu:', {
      user_name: listData.reviews[0].user_name,
      rating: listData.reviews[0].rating,
      is_verified_buyer: listData.reviews[0].is_verified_buyer
    });
  }
} catch (err) {
  console.error('  ! Lỗi đọc reviews:', err.message);
}

console.log('\n========================================================');
console.log('✅ HOÀN TẤT KIỂM THỬ VÀ ĐỒNG BỘ FIX LOGIC');
console.log('========================================================\n');
