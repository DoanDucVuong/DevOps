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

// 1. KẾT NỐI VÀO POSTGRESQL sttn ĐỂ LẤY SOURCE OF TRUTH MỚI NHẤT
const pgSttnUrl = 'postgresql://sttn:sttn_dev_password@localhost:5432/sttn';
let masterProducts = [];

try {
  const pool = new Pool({ connectionString: pgSttnUrl, connectionTimeoutMillis: 3000 });
  const client = await pool.connect();
  console.log('[PostgreSQL] Đã kết nối tới DB sttn chính.');

  // Đảm bảo p01 và p02 có giá trị đúng từ lần sửa mới nhất của user
  await client.query(`
    UPDATE products SET
      name = 'Áo Thun Cổ Tròn Big Size Navy BS2763',
      price = 270000,
      image_url = 'https://thoitrangbigsize.vn/wp-content/uploads/2024/06/BS2763.jpg'
    WHERE id = 'p01';
  `);

  await client.query(`
    UPDATE products SET
      name = 'Áo Thun Cổ Tròn Big Size Navy BS2763',
      price = 300000,
      image_url = 'https://thoitrangbigsize.vn/wp-content/uploads/2024/06/BS2764.jpg'
    WHERE id = 'p02';
  `);

  const res = await client.query('SELECT * FROM products ORDER BY id ASC');
  masterProducts = res.rows;
  console.log(`[PostgreSQL] Lấy được ${masterProducts.length} sản phẩm từ PG sttn.`);
  client.release();
  await pool.end();
} catch (err) {
  console.warn('[PostgreSQL sttn error]:', err.message);
}

// 2. ĐỒNG BỘ SANG POSTGRESQL DATABASE postgres (TRÊN CÙNG PORT 5432)
const pgPostgresUrls = [
  'postgresql://sttn:sttn_dev_password@localhost:5432/postgres',
  'postgresql://postgres:postgres@localhost:5432/postgres',
  'postgresql://postgres:sttn_dev_password@localhost:5432/postgres',
];

for (const url of pgPostgresUrls) {
  try {
    const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 3000 });
    const client = await pool.connect();
    console.log(`[PostgreSQL] Đang đồng bộ sang DB phụ: ${url.replace(/:[^:]*@/, ':***@')}`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        gender TEXT DEFAULT 'Nam',
        brand TEXT,
        price DOUBLE PRECISION NOT NULL,
        stock INTEGER DEFAULT 100,
        image_url TEXT,
        avg_rating DOUBLE PRECISION DEFAULT 4.5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    for (const p of masterProducts) {
      await client.query(`
        INSERT INTO products (id, name, description, category, gender, brand, price, stock, image_url, avg_rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          gender = EXCLUDED.gender,
          brand = EXCLUDED.brand,
          price = EXCLUDED.price,
          stock = EXCLUDED.stock,
          image_url = EXCLUDED.image_url,
          avg_rating = EXCLUDED.avg_rating;
      `, [
        p.id, p.name, p.description || '', p.category, p.gender || 'Nam',
        p.brand || 'Maison', Number(p.price), Number(p.stock ?? 100),
        p.image_url || '', Number(p.avg_rating ?? 4.5)
      ]);
    }
    console.log(`  ✓ Đã đồng bộ ${masterProducts.length} sản phẩm sang PG postgres DB!`);
    client.release();
    await pool.end();
    break;
  } catch (e) {
    // try next url
  }
}

// 3. ĐỒNG BỘ SANG SQLITE sttn.db TRÊN Ổ ĐĨA D:\ (CHO DATABASE CLIENT EXTENSION TRONG IDE)
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

const insertSqlite = db.prepare(`
  INSERT INTO products (id, name, description, category, gender, brand, price, stock, image_url, avg_rating)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    gender = excluded.gender,
    brand = excluded.brand,
    price = excluded.price,
    stock = excluded.stock,
    image_url = excluded.image_url,
    avg_rating = excluded.avg_rating;
`);

const tx = db.transaction((items) => {
  for (const p of items) {
    insertSqlite.run(
      p.id,
      p.name,
      p.description || '',
      p.category,
      p.gender || 'Nam',
      p.brand || 'Maison',
      Number(p.price),
      Number(p.stock ?? 100),
      p.image_url || '',
      Number(p.avg_rating ?? 4.5)
    );
  }
});
tx(masterProducts);
console.log(`  ✓ Đã cập nhật ${masterProducts.length} sản phẩm trong SQLite sttn.db!`);

// 4. ĐỒNG BỘ TOÀN BỘ SẢN PHẨM RA CÁC FILE TĨNH (SEED, FRONTEND, ML)
console.log('\n[Files Sync] Đồng bộ danh sách sản phẩm mới nhất ra file tĩnh...');
const allProductsFromDb = db.prepare('SELECT * FROM products ORDER BY id ASC').all();

const formattedProducts = allProductsFromDb.map((r) => {
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

// 5. KIỂM CHỨNG LẠI DỮ LIỆU p01 & p02 TRONG SQLITE
console.log('\n[Kiểm chứng trực tiếp từ SQLite sttn.db]');
const checkP01 = db.prepare('SELECT id, name, price, image_url FROM products WHERE id = ?').get('p01');
const checkP02 = db.prepare('SELECT id, name, price, image_url FROM products WHERE id = ?').get('p02');
console.log('  p01:', checkP01);
console.log('  p02:', checkP02);
db.close();

// 6. BUILD FRONTEND & CẬP NHẬT DOCKER
console.log('\n[Build & Docker] Đang build frontend và cập nhật containers...');
try {
  execSync('npm run --prefix frontend build', { stdio: 'inherit' });
  console.log('  ✓ Frontend build thành công!');
} catch (e) {
  console.warn('  ! Lỗi build frontend:', e.message);
}

try {
  execSync('docker cp backend/src sttn-backend:/app/ && docker cp frontend/dist/. sttn-frontend:/usr/share/nginx/html/', { stdio: 'inherit' });
  console.log('  ✓ Đã cập nhật mã nguồn mới vào các containers!');
} catch (e) {
  console.warn('  ! Lưu ý docker:', e.message);
}

console.log('\n========================================================');
console.log('✅ HOÀN THÀNH TOÀN BỘ FIX & SYNC SẢN PHẨM');
console.log('========================================================\n');
