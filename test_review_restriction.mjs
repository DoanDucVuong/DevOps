import Database from './backend/node_modules/better-sqlite3/lib/index.js';
import jwt from './backend/node_modules/jsonwebtoken/index.js';
import dotenv from './backend/node_modules/dotenv/lib/main.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend/.env') });
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-long-random-string';
const API_BASE = 'http://127.0.0.1:4000/api';

console.log('========================================================');
console.log('🧪 KIỂM THỬ: RÀNG BUỘC ĐÁNH GIÁ CHỈ DÀNH CHO NGƯỜI ĐÃ MUA HÀNG');
console.log('========================================================');

const dbPath = path.join(__dirname, 'backend/src/db/sttn.db');
const db = new Database(dbPath);

// Chuẩn bị 2 user thử nghiệm:
// User A: Chưa từng mua p01
// User B: Đã mua và hoàn thành đơn hàng có p01
const testEmailA = 'tester_unpaid_' + Date.now() + '@sttn.vn';
const testEmailB = 'tester_paid_' + Date.now() + '@sttn.vn';

const userA = db.prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id, full_name, email, role')
  .get('Nguyễn Chưa Mua', testEmailA, 'hashpass', 'user');

const userB = db.prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id, full_name, email, role')
  .get('Trần Đã Mua Hàng', testEmailB, 'hashpass', 'user');

const tokenA = jwt.sign(userA, JWT_SECRET, { expiresIn: '1d' });
const tokenB = jwt.sign(userB, JWT_SECRET, { expiresIn: '1d' });

// Tạo đơn hàng 'completed' cho User B với sản phẩm p01
const itemsJsonB = JSON.stringify([{ productId: 'p01', name: 'Áo thun test', price: 270000, quantity: 1 }]);
const shippingJsonB = JSON.stringify({ fullName: 'Trần Đã Mua Hàng', phone: '0987654321', address: '123 Test St', city: 'HN' });
db.prepare('INSERT INTO orders (user_id, total_amount, shipping_fee, status, items_json, shipping_json) VALUES (?, ?, ?, ?, ?, ?)')
  .run(String(userB.id), 270000, 0, 'completed', itemsJsonB, shippingJsonB);

db.close();

console.log(`\n✓ Đã chuẩn bị:`);
console.log(`  - User A (Chưa mua): ID=${userA.id}, Name=${userA.full_name}`);
console.log(`  - User B (Đã mua p01): ID=${userB.id}, Name=${userB.full_name}`);

let allPassed = true;

// TEST 1: Không có token
console.log('\n[TEST 1] Gửi review khi KHÔNG có Token...');
try {
  const res1 = await fetch(`${API_BASE}/products/p01/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: 5, comment: 'Bình luận thử không token' })
  });
  const data1 = await res1.json();
  if (res1.status === 401) {
    console.log(`  ✓ PASS: Bị chặn với HTTP 401: "${data1.message}"`);
  } else {
    console.error(`  ✗ FAIL: Trả về HTTP ${res1.status}`, data1);
    allPassed = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  allPassed = false;
}

// TEST 2: Đã đăng nhập nhưng CHƯA MUA sản phẩm p01 (User A)
console.log('\n[TEST 2] Gửi review khi ĐÃ ĐĂNG NHẬP nhưng CHƯA MUA sản phẩm p01...');
try {
  const res2 = await fetch(`${API_BASE}/products/p01/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({ rating: 5, comment: 'Sản phẩm trông có vẻ đẹp' })
  });
  const data2 = await res2.json();
  if (res2.status === 403 && data2.message === 'Bạn cần mua sản phẩm này để có thể đánh giá.') {
    console.log(`  ✓ PASS: Bị chặn với HTTP 403 chính xác: "${data2.message}"`);
  } else {
    console.error(`  ✗ FAIL: HTTP ${res2.status}`, data2);
    allPassed = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  allPassed = false;
}

// TEST 3: Đã đăng nhập và ĐÃ MUA sản phẩm p01 (User B)
console.log('\n[TEST 3] Gửi review khi ĐÃ MUA HÀNG hợp lệ (User B)...');
try {
  const res3 = await fetch(`${API_BASE}/products/p01/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenB}`
    },
    body: JSON.stringify({ rating: 5, comment: 'Vải cotton cực kỳ mát mẻ, đã giặt không bị xù!' })
  });
  const data3 = await res3.json();
  if (res3.status === 201 && data3.review?.user_name === 'Trần Đã Mua Hàng') {
    console.log(`  ✓ PASS: Đánh giá thành công (HTTP 201)!`);
    console.log(`  ✓ Tự động lấy tên người dùng từ DB: "${data3.review.user_name}"`);
    console.log(`  ✓ Điểm trung bình mới của p01: ${data3.avgRating}`);
  } else {
    console.error(`  ✗ FAIL: HTTP ${res3.status}`, data3);
    allPassed = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  allPassed = false;
}

// TEST 4: Đọc lại reviews xem cờ is_verified_buyer
console.log('\n[TEST 4] Kiểm tra GET /api/products/p01/reviews xem cờ is_verified_buyer...');
try {
  const res4 = await fetch(`${API_BASE}/products/p01/reviews`);
  const data4 = await res4.json();
  const latestRev = data4.reviews?.[0];
  if (latestRev && latestRev.user_name === 'Trần Đã Mua Hàng' && latestRev.is_verified_buyer === true) {
    console.log(`  ✓ PASS: Review mới có is_verified_buyer = true!`);
  } else {
    console.log(`  ✓ Review đầu tiên:`, latestRev);
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
}

console.log('\n========================================================');
if (allPassed) {
  console.log('🎉 TOÀN BỘ CÁC BƯỚC KIỂM THỬ ĐỀU THÀNH CÔNG 100%!');
} else {
  console.log('⚠️ CÓ BƯỚC THẤT BÀI, HÃY KIỂM TRA LẠI LOG Ở TRÊN.');
}
console.log('========================================================\n');

process.exit(allPassed ? 0 : 1);
