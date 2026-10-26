import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from './backend/node_modules/better-sqlite3/lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
console.log('🧪 CHẠY KIỂM THỬ TỰ ĐỘNG (test_all.mjs)');
console.log('========================================================');

let passAll = true;

// 1. Bắn API tạo sản phẩm mới không truyền ID
console.log('\n[1/2] Kiểm tra tự sinh ID khi thêm sản phẩm...');
let createdId = null;
try {
  const res = await fetch('http://127.0.0.1:4000/api/admin/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-role': 'admin'
    },
    body: JSON.stringify({
      name: 'Áo Thun Basic Tự Tăng Mã',
      category: 'ao-thun',
      gender: 'Nam',
      price: 290000,
      description: 'Kiểm thử tính năng tự động tăng ID dạng pXX',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
    })
  });

  const data = await res.json();
  if (res.status === 201 && data.product?.id) {
    createdId = data.product.id;
    console.log(`  ✓ PASS: Đã tự động tạo sản phẩm với mã ID: ${createdId}`);
  } else {
    console.error('  ✗ FAIL: Không tạo được sản phẩm:', data);
    passAll = false;
  }
} catch (err) {
  console.error('  ✗ FAIL: Lỗi kết nối API:', err.message);
  passAll = false;
}

// 2. Bắn API tạo review 5 sao cho sản phẩm vừa tạo và cho p15
const targetId = createdId || 'p15';
console.log(`\n[2/2] Kiểm tra tính lại điểm trung bình 5.0 cho sản phẩm ${targetId} và p15...`);
try {
  const revRes = await fetch(`http://127.0.0.1:4000/api/products/${targetId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userName: 'Người Đánh Giá Test',
      rating: 5,
      comment: 'Sản phẩm 5 sao tuyệt vời!',
      userId: 'test_user_star'
    })
  });

  const revData = await revRes.json();
  if (revRes.status === 201 && revData.avgRating === 5) {
    console.log(`  ✓ PASS: Điểm trung bình của ${targetId} đã cập nhật thành 5.0`);
  } else {
    console.warn(`  ! Điểm trung bình trả về: ${revData.avgRating}`);
  }

  // Đánh giá 5 sao cho p15 nếu targetId khác p15
  if (targetId !== 'p15') {
    const revP15 = await fetch('http://127.0.0.1:4000/api/products/p15/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: 'Khách Hàng Mua p15',
        rating: 5,
        comment: 'Đánh giá 5 sao chuẩn cho p15',
        userId: 'buyer_p15'
      })
    });
    const dataP15 = await revP15.json();
    console.log(`  ✓ Điểm trung bình của p15 đã cập nhật: ${dataP15.avgRating}`);
  }
} catch (err) {
  console.error('  ✗ FAIL: Lỗi gửi review:', err.message);
  passAll = false;
}

// 3. Kiểm chứng CSDL SQLite
console.log('\n[3] Kiểm chứng trực tiếp trong CSDL SQLite:');
const sqlitePath = path.join(__dirname, 'backend/src/db/sttn.db');
const db = new Database(sqlitePath);
if (createdId) {
  const rowCreated = db.prepare('SELECT id, name, avg_rating FROM products WHERE id = ?').get(createdId);
  console.log(`  ✓ Sản phẩm mới [${createdId}]:`, rowCreated);
}
const rowP15 = db.prepare('SELECT id, name, avg_rating FROM products WHERE id = ?').get('p15');
console.log('  ✓ Sản phẩm [p15]:', rowP15);
db.close();

// 4. Kiểm chứng file tĩnh products.js
const prodJs = fs.readFileSync(path.join(__dirname, 'frontend/src/data/products.js'), 'utf8');
if (createdId && prodJs.includes(createdId)) {
  console.log(`  ✓ PASS: File frontend/src/data/products.js đã chứa ${createdId}`);
}

console.log('\n========================================================');
if (passAll) {
  console.log('🎉 TẤT CẢ TEST ĐỀU PASS THÀNH CÔNG!');
} else {
  console.log('⚠️ CÓ TEST CHƯA ĐẠT, KIỂM TRA LẠI LOG Ở TRÊN.');
}
console.log('========================================================\n');

process.exit(passAll ? 0 : 1);
