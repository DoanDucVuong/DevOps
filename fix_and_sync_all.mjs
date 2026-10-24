import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import pg from 'pg';
import Database from './backend/node_modules/better-sqlite3/lib/index.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('========================================================');
console.log('🚀 BẮT ĐẦU FIX VÀ ĐỒNG BỘ TOÀN DIỆN DATABASE & FILE TĨNH');
console.log('========================================================');

const P01_DATA = {
  id: 'p01',
  name: 'Áo Thun Cổ Tròn Big Size Navy BS2763',
  price: 270000,
  image_url: 'https://thoitrangbigsize.vn/wp-content/uploads/2024/06/BS2763.jpg',
  category: 'ao-thun',
  gender: 'Nam',
};

const P02_DATA = {
  id: 'p02',
  name: 'Đoàn Đức Vương',
  price: 300000,
  image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80',
  category: 'ao-thun',
  gender: 'Nam',
};

// 1. CẬP NHẬT POSTGRESQL (CẢ DATABASE sttn VÀ postgres)
const pgUrls = [
  'postgresql://sttn:sttn_dev_password@localhost:5432/sttn',
  'postgresql://sttn:sttn_dev_password@localhost:5432/postgres',
  'postgresql://postgres:postgres@localhost:5432/postgres',
  'postgresql://postgres:sttn_dev_password@localhost:5432/postgres',
];

for (const url of pgUrls) {
  try {
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
    const client = await pool.connect();
    console.log(`\n[PostgreSQL] Kết nối thành công: ${url.replace(/:[^:]*@/, ':***@')}`);

    // Kiểm tra cấu trúc bảng products
    const colsRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products'
    `);
    const cols = colsRes.rows.map((r) => r.column_name);
    console.log(`  Các cột trong bảng products: ${cols.join(', ')}`);

    const hasImgUrl = cols.includes('image_url');
    const hasImage = cols.includes('image');

    // Cập nhật p01
    let updateSqlP01 = 'UPDATE products SET name = $1, price = $2';
    const paramsP01 = [P01_DATA.name, P01_DATA.price];
    let pIdx = 3;
    if (hasImgUrl) {
      updateSqlP01 += `, image_url = $${pIdx++}`;
      paramsP01.push(P01_DATA.image_url);
    }
    if (hasImage) {
      updateSqlP01 += `, image = $${pIdx++}`;
      paramsP01.push(P01_DATA.image_url);
    }
    updateSqlP01 += ` WHERE id = $${pIdx}`;
    paramsP01.push(P01_DATA.id);
    await client.query(updateSqlP01, paramsP01);
    console.log(`  ✓ Đã cập nhật p01 trong PostgreSQL (${P01_DATA.name})`);

    // Cập nhật p02
    let updateSqlP02 = 'UPDATE products SET name = $1, price = $2';
    const paramsP02 = [P02_DATA.name, P02_DATA.price];
    pIdx = 3;
    if (hasImgUrl) {
      updateSqlP02 += `, image_url = $${pIdx++}`;
      paramsP02.push(P02_DATA.image_url);
    }
    if (hasImage) {
      updateSqlP02 += `, image = $${pIdx++}`;
      paramsP02.push(P02_DATA.image_url);
    }
    updateSqlP02 += ` WHERE id = $${pIdx}`;
    paramsP02.push(P02_DATA.id);
    await client.query(updateSqlP02, paramsP02);
    console.log(`  ✓ Đã cập nhật p02 trong PostgreSQL (${P02_DATA.name})`);

    client.release();
    await pool.end();
  } catch (err) {
    // URL nào không kết nối được thì bỏ qua
  }
}

// 2. CẬP NHẬT SQLITE sttn.db
const sqlitePath = path.join(__dirname, 'backend/src/db/sttn.db');
console.log(`\n[SQLite] Mở CSDL SQLite tại: ${sqlitePath}`);
const db = new Database(sqlitePath);

// Lấy danh sách cột
const tableInfo = db.prepare('PRAGMA table_info(products)').all();
const sqliteCols = tableInfo.map((c) => c.name);
console.log(`  Các cột trong bảng products SQLite: ${sqliteCols.join(', ')}`);

const sHasImgUrl = sqliteCols.includes('image_url');
const sHasImage = sqliteCols.includes('image');

// Update p01
let sSqlP01 = 'UPDATE products SET name = ?, price = ?';
const sParamsP01 = [P01_DATA.name, P01_DATA.price];
if (sHasImgUrl) {
  sSqlP01 += ', image_url = ?';
  sParamsP01.push(P01_DATA.image_url);
}
if (sHasImage) {
  sSqlP01 += ', image = ?';
  sParamsP01.push(P01_DATA.image_url);
}
sSqlP01 += ' WHERE id = ?';
sParamsP01.push(P01_DATA.id);
db.prepare(sSqlP01).run(...sParamsP01);
console.log(`  ✓ Đã cập nhật p01 trong SQLite (${P01_DATA.name})`);

// Update p02
let sSqlP02 = 'UPDATE products SET name = ?, price = ?';
const sParamsP02 = [P02_DATA.name, P02_DATA.price];
if (sHasImgUrl) {
  sSqlP02 += ', image_url = ?';
  sParamsP02.push(P02_DATA.image_url);
}
if (sHasImage) {
  sSqlP02 += ', image = ?';
  sParamsP02.push(P02_DATA.image_url);
}
sSqlP02 += ' WHERE id = ?';
sParamsP02.push(P02_DATA.id);
db.prepare(sSqlP02).run(...sParamsP02);
console.log(`  ✓ Đã cập nhật p02 trong SQLite (${P02_DATA.name})`);

// 3. ĐỒNG BỘ TOÀN BỘ DANH SÁCH SẢN PHẨM RA CÁC FILE TĨNH
console.log('\n[Files Sync] Đồng bộ danh sách sản phẩm mới nhất ra file tĩnh...');
const allSqliteProducts = db.prepare('SELECT * FROM products ORDER BY id ASC').all();

const formattedProducts = allSqliteProducts.map((r) => {
  const img = r.image_url || r.image || '';
  return {
    id: r.id,
    name: r.name,
    gender: r.gender || 'Nam',
    category: r.category || 'ao-thun',
    brand: r.brand || 'Maison',
    price: Number(r.price),
    oldPrice: r.old_price ? Number(r.old_price) : null,
    stock: Number(r.stock ?? 100),
    rating: Number(r.avg_rating ?? 4.5),
    avg_rating: Number(r.avg_rating ?? 4.5),
    review_count: 50,
    colors: ['den', 'trang', 'be'],
    sizes: ['S', 'M', 'L', 'XL'],
    image_url: img,
    images: img ? [img] : [],
    isNew: true,
    isFeatured: false,
    description: r.description || '',
  };
});

// Ghi seed-products.json
const seedJsonPath = path.join(__dirname, 'backend/src/db/seed-products.json');
fs.writeFileSync(seedJsonPath, JSON.stringify(formattedProducts, null, 2), 'utf8');
console.log(`  ✓ Đã ghi ${formattedProducts.length} sản phẩm ra ${seedJsonPath}`);

// Ghi ml-service/data/products.json
const mlJsonPath = path.join(__dirname, 'ml-service/data/products.json');
if (fs.existsSync(path.dirname(mlJsonPath))) {
  fs.writeFileSync(mlJsonPath, JSON.stringify(formattedProducts, null, 2), 'utf8');
  console.log(`  ✓ Đã ghi ${formattedProducts.length} sản phẩm ra ${mlJsonPath}`);
}

// Ghi frontend/src/data/products.js
const frontendJsPath = path.join(__dirname, 'frontend/src/data/products.js');
const frontendJsContent = `// Danh sách ${formattedProducts.length} sản phẩm thời trang tự động đồng bộ theo thời gian thực từ Database
export const products = ${JSON.stringify(formattedProducts, null, 2)};

export const getProductById = (id) => products.find((p) => p.id === id);
`;
fs.writeFileSync(frontendJsPath, frontendJsContent, 'utf8');
console.log(`  ✓ Đã ghi ${formattedProducts.length} sản phẩm ra ${frontendJsPath}`);

// 4. KIỂM CHỨNG LẠI DỮ LIỆU p01 & p02 TRONG SQLITE
console.log('\n[Kiểm chứng SQLite]');
const checkP01 = db.prepare('SELECT id, name, price, image_url FROM products WHERE id = ?').get('p01');
const checkP02 = db.prepare('SELECT id, name, price, image_url FROM products WHERE id = ?').get('p02');
console.log('  p01:', checkP01);
console.log('  p02:', checkP02);
db.close();

// 5. BUILD FRONTEND & CẬP NHẬT DOCKER CONTAINERS
console.log('\n[Build & Docker] Đang build frontend và cập nhật containers...');
try {
  execSync('npm run --prefix frontend build', { stdio: 'inherit' });
  console.log('  ✓ Frontend build thành công!');
} catch (e) {
  console.warn('  ! Lỗi build frontend:', e.message);
}

try {
  execSync('docker cp backend/src sttn-backend:/app/ && docker cp frontend/dist/. sttn-frontend:/usr/share/nginx/html/ && docker restart sttn-backend sttn-frontend sttn-ml-service', { stdio: 'inherit' });
  console.log('  ✓ Đã cập nhật và khởi động lại toàn bộ containers!');
} catch (e) {
  console.warn('  ! Lưu ý docker:', e.message);
}

console.log('\n========================================================');
console.log('✅ HOÀN THÀNH TOÀN BỘ FIX & SYNC SẢN PHẨM');
console.log('========================================================\n');
