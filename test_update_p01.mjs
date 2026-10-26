import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from './backend/node_modules/pg/lib/index.js';
import Database from './backend/node_modules/better-sqlite3/lib/index.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
console.log('🧪 BẮT ĐẦU TEST CẬP NHẬT SẢN PHẨM p01 VÀ KIỂM CHỨNG DB');
console.log('========================================================');

const targetName = 'Test Update 123';
const targetImg = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';

// 1. GỌI API PUT /api/admin/products/p01
console.log('\n[1] Gửi request PUT /api/admin/products/p01 tới Backend http://127.0.0.1:4000...');
try {
  const res = await fetch('http://127.0.0.1:4000/api/admin/products/p01', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-role': 'admin'
    },
    body: JSON.stringify({
      name: targetName,
      price: 270000,
      category: 'ao-thun',
      gender: 'Nam',
      image_url: targetImg
    })
  });

  const resJson = await res.json();
  console.log(`  ✓ HTTP Status: ${res.status}`);
  console.log('  ✓ Response:', JSON.stringify(resJson, null, 2));
} catch (apiErr) {
  console.warn('  ! Lỗi gọi API:', apiErr.message);
}

// 2. KIỂM CHỨNG POSTGRESQL (CẢ sttn VÀ postgres)
console.log('\n[2] Kiểm chứng dữ liệu trong PostgreSQL:');
for (const dbName of ['sttn', 'postgres']) {
  try {
    const pool = new Pool({
      connectionString: `postgresql://sttn:sttn_dev_password@127.0.0.1:5432/${dbName}`,
      connectionTimeoutMillis: 2000
    });
    const { rows } = await pool.query("SELECT id, name, price, image_url FROM products WHERE id = 'p01'");
    console.log(`  ✓ PG [${dbName}]:`, rows[0]);
    await pool.end();
  } catch (pgErr) {
    console.warn(`  ! Không thể đọc PG [${dbName}]:`, pgErr.message);
  }
}

// 3. KIỂM CHỨNG SQLITE sttn.db
console.log('\n[3] Kiểm chứng dữ liệu trong SQLite sttn.db:');
try {
  const sqliteDb = new Database(path.join(__dirname, 'backend/src/db/sttn.db'));
  const row = sqliteDb.prepare("SELECT id, name, price, image_url FROM products WHERE id = 'p01'").get();
  console.log('  ✓ SQLite sttn.db:', row);
  sqliteDb.close();
} catch (sqlErr) {
  console.warn('  ! Lỗi đọc SQLite:', sqlErr.message);
}

// 4. KIỂM CHỨNG FILE TĨNH frontend/src/data/products.js
console.log('\n[4] Kiểm chứng file frontend/src/data/products.js:');
try {
  const prodJs = fs.readFileSync(path.join(__dirname, 'frontend/src/data/products.js'), 'utf8');
  const hasName = prodJs.includes(targetName);
  const hasImg = prodJs.includes(targetImg);
  console.log(`  ✓ products.js chứa tên mới "${targetName}":`, hasName);
  console.log(`  ✓ products.js chứa link ảnh mới:`, hasImg);
} catch (fileErr) {
  console.warn('  ! Lỗi đọc products.js:', fileErr.message);
}

// 5. KIỂM CHỨNG FILE backend/src/db/seed-products.json
console.log('\n[5] Kiểm chứng file backend/src/db/seed-products.json:');
try {
  const seedJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend/src/db/seed-products.json'), 'utf8'));
  const p01 = seedJson.find(p => p.id === 'p01');
  console.log('  ✓ seed-products.json p01:', p01 ? { id: p01.id, name: p01.name, image_url: p01.image_url } : 'NOT FOUND');
} catch (seedErr) {
  console.warn('  ! Lỗi đọc seed-products.json:', seedErr.message);
}

console.log('\n========================================================');
console.log('✅ TEST HOÀN TẤT!');
console.log('========================================================');
