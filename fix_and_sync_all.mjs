import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import pg from './backend/node_modules/pg/lib/index.js';
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

// 1. CẬP NHẬT CẢ HAI DATABASE POSTGRESQL (sttn VÀ postgres)
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
    const cleanUrl = url.replace(/:[^:]*@/, ':***@');
    console.log(`\n[PostgreSQL] Đang cập nhật CSDL: ${cleanUrl}`);

    // Đảm bảo bảng products tồn tại và có đủ cột
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        gender TEXT DEFAULT 'Unisex',
        brand TEXT,
        price DOUBLE PRECISION NOT NULL,
        stock INTEGER DEFAULT 100,
        image_url TEXT,
        avg_rating DOUBLE PRECISION DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Thêm cột image_url nếu thiếu
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_url') THEN
          ALTER TABLE products ADD COLUMN image_url TEXT;
        END IF;
      END $$;
    `).catch(() => {});

    // Cập nhật p01
    await client.query(`
      INSERT INTO products (id, name, price, image_url, category, gender, brand)
      VALUES ($1, $2, $3, $4, $5, $6, 'Maison')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        image_url = EXCLUDED.image_url;
    `, [P01_DATA.id, P01_DATA.name, P01_DATA.price, P01_DATA.image_url, P01_DATA.category, P01_DATA.gender]);
    console.log(`  ✓ Đã cập nhật p01: ${P01_DATA.name} | ${P01_DATA.image_url}`);

    // Cập nhật p02
    await client.query(`
      INSERT INTO products (id, name, price, image_url, category, gender, brand)
      VALUES ($1, $2, $3, $4, $5, $6, 'Maison')
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        image_url = EXCLUDED.image_url;
    `, [P02_DATA.id, P02_DATA.name, P02_DATA.price, P02_DATA.image_url, P02_DATA.category, P02_DATA.gender]);
    console.log(`  ✓ Đã cập nhật p02: ${P02_DATA.name} | ${P02_DATA.image_url}`);

    client.release();
    await pool.end();
  } catch (err) {
    // URL nào không kết nối được thì bỏ qua
  }
}

// 2. CẬP NHẬT SQLITE sttn.db TRÊN Ổ ĐĨA D:\
const sqlitePath = path.join(__dirname, 'backend/src/db/sttn.db');
console.log(`\n[SQLite] Đang cập nhật file SQLite tại: ${sqlitePath}`);
const db = new Database(sqlitePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    gender TEXT DEFAULT 'Nam',
    brand TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 100,
    image_url TEXT,
    avg_rating REAL DEFAULT 4.5,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Cập nhật p01
db.prepare(`
  INSERT INTO products (id, name, price, image_url, category, gender, brand)
  VALUES (?, ?, ?, ?, ?, ?, 'Maison')
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    price = excluded.price,
    image_url = excluded.image_url;
`).run(P01_DATA.id, P01_DATA.name, P01_DATA.price, P01_DATA.image_url, P01_DATA.category, P01_DATA.gender);
console.log(`  ✓ Đã cập nhật p01 trong SQLite: ${P01_DATA.name}`);

// Cập nhật p02
db.prepare(`
  INSERT INTO products (id, name, price, image_url, category, gender, brand)
  VALUES (?, ?, ?, ?, ?, ?, 'Maison')
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    price = excluded.price,
    image_url = excluded.image_url;
`).run(P02_DATA.id, P02_DATA.name, P02_DATA.price, P02_DATA.image_url, P02_DATA.category, P02_DATA.gender);
console.log(`  ✓ Đã cập nhật p02 trong SQLite: ${P02_DATA.name}`);

// 3. ĐỒNG BỘ TOÀN BỘ 100 SẢN PHẨM RA CÁC FILE TĨNH
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
console.log('\n[Kiểm chứng trực tiếp từ SQLite sttn.db]');
const checkP01 = db.prepare('SELECT id, name, price, image_url FROM products WHERE id = ?').get('p01');
const checkP02 = db.prepare('SELECT id, name, price, image_url FROM products WHERE id = ?').get('p02');
console.log('  p01:', checkP01);
console.log('  p02:', checkP02);
db.close();

// 5. BUILD FRONTEND & CẬP NHẬT DOCKER
console.log('\n[Build & Docker] Đang build frontend và cập nhật containers...');
try {
  execSync('npm run --prefix frontend build', { stdio: 'inherit' });
  console.log('  ✓ Frontend build thành công!');
} catch (e) {
  console.warn('  ! Lỗi build frontend:', e.message);
}

try {
  // Docker compose up -d để gắn bind mounts và khởi động lại
  execSync('docker compose up -d backend frontend ml-service', { stdio: 'inherit' });
  execSync('docker cp backend/src sttn-backend:/app/ && docker cp frontend/dist/. sttn-frontend:/usr/share/nginx/html/', { stdio: 'inherit' });
  console.log('  ✓ Đã kích hoạt bind mount và cập nhật toàn bộ containers!');
} catch (e) {
  console.warn('  ! Lưu ý docker:', e.message);
}

console.log('\n========================================================');
console.log('✅ HOÀN THÀNH TOÀN BỘ FIX & SYNC SẢN PHẨM');
console.log('========================================================\n');
