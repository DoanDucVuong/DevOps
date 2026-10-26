import jwt from './backend/node_modules/jsonwebtoken/index.js';
import dotenv from './backend/node_modules/dotenv/lib/main.js';
import Database from './backend/node_modules/better-sqlite3/lib/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-long-random-string';
const API_BASE = 'http://127.0.0.1:4000/api';
const dbPath = path.join(__dirname, 'backend/src/db/sttn.db');

console.log('========================================================');
console.log('🧪 KIỂM THỬ: TẠO ĐƠN HÀNG THANH TOÁN COD (test_create_order.mjs)');
console.log('========================================================');

const db = new Database(dbPath);

// Chuẩn bị User thử nghiệm
const testEmail = 'buyer_order_' + Date.now() + '@sttn.vn';
const userRow = db.prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?) RETURNING id, full_name, email, role')
  .get('Lê Văn Khách Hàng', testEmail, 'secretpass', 'user');

const token = jwt.sign(userRow, JWT_SECRET, { expiresIn: '1d' });

// Ghi nhận số lượt dùng voucher MAISON10 trước khi đặt hàng
const voucherBefore = db.prepare("SELECT used_count FROM vouchers WHERE code = 'MAISON10'").get();
const usedCountBefore = voucherBefore ? voucherBefore.used_count : 0;
db.close();

console.log(`✓ Đã tạo user thử nghiệm: ID=${userRow.id}, Name=${userRow.full_name}, Email=${userRow.email}`);
console.log(`✓ Lượt dùng voucher MAISON10 ban đầu: ${usedCountBefore}`);

let allPassed = true;

// 1. TEST TẠO ĐƠN HÀNG COD KÈM VOUCHER
console.log('\n[TEST 1] Gửi request POST /api/orders (COD + Voucher MAISON10)...');
let createdOrder = null;
try {
  const orderPayload = {
    items: [
      {
        productId: 'p01',
        name: 'Áo Thun Cổ Tròn Big Size Navy',
        price: 270000,
        quantity: 2,
        size: 'L',
        color: 'den',
        image: 'https://thoitrangbigsize.vn/wp-content/uploads/2024/06/BS2763.jpg'
      }
    ],
    shipping_info: {
      fullName: 'Lê Văn Khách Hàng',
      phone: '0912345678',
      address: '456 Phố Huế',
      city: 'Hà Nội',
      note: 'Giao giờ hành chính'
    },
    payment_method: 'cod',
    voucher_code: 'MAISON10',
    total_amount: 540000
  };

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderPayload)
  });

  const data = await res.json();
  if (res.status === 201 && data.code && data.status === 'pending') {
    createdOrder = data;
    console.log(`  ✓ PASS: Đặt hàng thành công với HTTP 201!`);
    console.log(`  ✓ Mã đơn hàng (ID): ${data.code} (numeric ID: ${data.orderId || data.id})`);
    console.log(`  ✓ Trạng thái: ${data.status}`);
    console.log(`  ✓ Tổng thanh toán: ${data.total.toLocaleString('vi-VN')} đ (Đã giảm: ${data.discountAmount?.toLocaleString('vi-VN')} đ)`);
  } else {
    console.error(`  ✗ FAIL: Trả về HTTP ${res.status}:`, data);
    allPassed = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  allPassed = false;
}

// 2. KIỂM CHỨNG CSDL SQLITE
console.log('\n[TEST 2] Kiểm chứng bản ghi trong bảng orders và vouchers...');
const verifyDb = new Database(dbPath);
if (createdOrder) {
  const orderNumericId = createdOrder.orderId || createdOrder.id;
  const dbOrder = verifyDb.prepare('SELECT id, user_id, total_amount, payment_method, status, items_json, shipping_json FROM orders WHERE id = ?')
    .get(orderNumericId);

  if (dbOrder && dbOrder.status === 'pending' && dbOrder.payment_method === 'cod') {
    console.log(`  ✓ PASS: Đơn hàng đã được lưu chính xác vào CSDL:`);
    console.log(`    - ID: ${dbOrder.id}, User ID: ${dbOrder.user_id}, Status: ${dbOrder.status}`);
    console.log(`    - Payment Method: ${dbOrder.payment_method}`);
    const parsedShipping = JSON.parse(dbOrder.shipping_json);
    console.log(`    - Người nhận: ${parsedShipping.fullName}, Địa chỉ: ${parsedShipping.address}, ${parsedShipping.city}`);
    const parsedItems = JSON.parse(dbOrder.items_json);
    console.log(`    - Số lượng món hàng: ${parsedItems.length} (Sản phẩm: ${parsedItems[0].productId})`);
  } else {
    console.error('  ✗ FAIL: Không tìm thấy đơn hàng trong DB hoặc sai thông tin:', dbOrder);
    allPassed = false;
  }

  // Kiểm tra lượt dùng voucher MAISON10
  const voucherAfter = verifyDb.prepare("SELECT used_count FROM vouchers WHERE code = 'MAISON10'").get();
  const usedCountAfter = voucherAfter ? voucherAfter.used_count : 0;
  if (usedCountAfter === usedCountBefore + 1) {
    console.log(`  ✓ PASS: Lượt dùng voucher MAISON10 đã tự động tăng từ ${usedCountBefore} -> ${usedCountAfter}!`);
  } else {
    console.warn(`  ! Lượt dùng voucher sau khi đặt: ${usedCountAfter}`);
  }
}
verifyDb.close();

// 3. KIỂM TRA LẤY DANH SÁCH ĐƠN HÀNG CỦA USER: GET /api/orders/me
console.log('\n[TEST 3] Kiểm tra GET /api/orders/me để lấy danh sách đơn hàng của user...');
try {
  const resMe = await fetch(`${API_BASE}/orders/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listOrders = await resMe.json();
  if (Array.isArray(listOrders) && listOrders.some((o) => o.code === createdOrder?.code || o.id === createdOrder?.code)) {
    console.log(`  ✓ PASS: User có thể xem đơn hàng vừa tạo trong danh sách đơn hàng (${listOrders.length} đơn)!`);
  } else {
    console.error('  ✗ FAIL: Không tìm thấy đơn hàng trong /orders/me:', listOrders);
    allPassed = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  allPassed = false;
}

console.log('\n========================================================');
if (allPassed) {
  console.log('🎉 TOÀN BỘ CÁC BƯỚC KIỂM THỬ ĐẶT HÀNG ĐỀU THÀNH CÔNG 100%!');
} else {
  console.log('⚠️ CÓ TEST CHƯA ĐẠT, VUI LÒNG KIỂM TRA LẠI.');
}
console.log('========================================================\n');

process.exit(allPassed ? 0 : 1);
