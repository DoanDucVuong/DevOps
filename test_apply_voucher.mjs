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
console.log('🧪 KIỂM THỬ: TÍNH NĂNG ÁP DỤNG VOUCHER (test_apply_voucher.mjs)');
console.log('========================================================');

const testUser = { id: 999, email: 'voucher_test@sttn.vn', role: 'user' };
const validToken = jwt.sign(testUser, JWT_SECRET, { expiresIn: '1d' });

let passAll = true;

// 1. TEST KHÔNG CÓ TOKEN -> YÊU CẦU 401
console.log('\n[TEST 1] Gọi API áp dụng voucher khi KHÔNG có JWT Token...');
try {
  const res1 = await fetch(`${API_BASE}/vouchers/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'MAISON10', order_total: 500000 })
  });
  const data1 = await res1.json();
  if (res1.status === 401) {
    console.log(`  ✓ PASS: Bị chặn với HTTP 401 ("${data1.message}")`);
  } else {
    console.error(`  ✗ FAIL: Trả về HTTP ${res1.status}`, data1);
    passAll = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  passAll = false;
}

// 2. TEST MÃ SAI / KHÔNG TỒN TẠI -> YÊU CẦU 404
console.log('\n[TEST 2] Gọi API áp dụng voucher với mã SAI / KHÔNG TỒN TẠI ("SAIMA999")...');
try {
  const res2 = await fetch(`${API_BASE}/vouchers/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({ code: 'SAIMA999', order_total: 500000 })
  });
  const data2 = await res2.json();
  if (res2.status === 404) {
    console.log(`  ✓ PASS: Bị từ chối với HTTP 404 ("${data2.message}")`);
  } else {
    console.error(`  ✗ FAIL: Trả về HTTP ${res2.status}`, data2);
    passAll = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  passAll = false;
}

// 3. TEST MÃ HỢP LỆ NHƯNG CHƯA ĐỦ ĐIỀU KIỆN MIN_ORDER_VALUE -> YÊU CẦU 400
console.log('\n[TEST 3] Gọi API áp dụng voucher "MAISON10" nhưng tổng tiền chưa đủ min_order_value (100k < 300k)...');
try {
  const res3 = await fetch(`${API_BASE}/vouchers/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({ code: 'MAISON10', order_total: 100000 })
  });
  const data3 = await res3.json();
  if (res3.status === 400) {
    console.log(`  ✓ PASS: Bị từ chối với HTTP 400 ("${data3.message}")`);
  } else {
    console.error(`  ✗ FAIL: Trả về HTTP ${res3.status}`, data3);
    passAll = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  passAll = false;
}

// 4. TEST MÃ HỢP LỆ VÀ ĐỦ ĐIỀU KIỆN -> YÊU CẦU 200 VỚI ĐỦ TRƯỜNG
console.log('\n[TEST 4] Gọi API áp dụng voucher "MAISON10" với tổng tiền hợp lệ (500k >= 300k)...');
try {
  const res4 = await fetch(`${API_BASE}/vouchers/apply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${validToken}`
    },
    body: JSON.stringify({ code: 'MAISON10', order_total: 500000 })
  });
  const data4 = await res4.json();
  if (res4.status === 200 && data4.success === true && data4.discount_amount === 50000 && data4.final_total === 450000) {
    console.log(`  ✓ PASS: Áp dụng thành công HTTP 200!`);
    console.log(`  ✓ Mã áp dụng: ${data4.code}`);
    console.log(`  ✓ Số tiền giảm: ${data4.discount_amount.toLocaleString('vi-VN')} đ`);
    console.log(`  ✓ Tổng tiền sau giảm: ${data4.final_total.toLocaleString('vi-VN')} đ`);
  } else {
    console.error(`  ✗ FAIL: Phản hồi không đúng định dạng mong đợi:`, data4);
    passAll = false;
  }
} catch (err) {
  console.error('  ✗ FAIL:', err.message);
  passAll = false;
}

console.log('\n========================================================');
if (passAll) {
  console.log('🎉 TẤT CẢ CÁC BƯỚC TEST VOUCHER ĐỀU PASS THÀNH CÔNG!');
} else {
  console.log('⚠️ CÓ TEST CHƯA ĐẠT, VUI LÒNG KIỂM TRA LẠI LOG Ở TRÊN.');
}
console.log('========================================================\n');

process.exit(passAll ? 0 : 1);
