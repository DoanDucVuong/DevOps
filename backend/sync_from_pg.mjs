import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import Database from './node_modules/better-sqlite3/lib/index.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const pool = new Pool({
  connectionString: 'postgresql://sttn:sttn_dev_password@localhost:5432/sttn',
});

async function sync() {
  console.log('Connecting to PostgreSQL...');
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM products ORDER BY created_at DESC, id ASC');
    console.log(`Fetched ${res.rows.length} products from PostgreSQL.`);

    // Update SQLite sttn.db
    const dbPath = path.join(rootDir, 'backend/src/db/sttn.db');
    const db = new Database(dbPath);

    // Create table if needed
    db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        gender TEXT DEFAULT 'Unisex',
        brand TEXT,
        price REAL NOT NULL,
        stock INTEGER DEFAULT 100,
        image_url TEXT,
        avg_rating REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const upsertStmt = db.prepare(`
      INSERT INTO products (id, name, description, category, gender, brand, price, stock, image_url, avg_rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        description=excluded.description,
        category=excluded.category,
        gender=excluded.gender,
        brand=excluded.brand,
        price=excluded.price,
        stock=excluded.stock,
        image_url=excluded.image_url,
        avg_rating=excluded.avg_rating
    `);

    const tx = db.transaction((rows) => {
      for (const r of rows) {
        upsertStmt.run(
          r.id,
          r.name,
          r.description || '',
          r.category,
          r.gender || 'Nam',
          r.brand || 'Maison',
          Number(r.price),
          Number(r.stock || 100),
          r.image_url || '',
          Number(r.avg_rating || 4.5)
        );
      }
    });

    tx(res.rows);
    console.log(`Successfully synced ${res.rows.length} products to SQLite: ${dbPath}`);

    // Update seed-products.json and frontend/src/data/products.js
    const jsonPath = path.join(rootDir, 'backend/src/db/seed-products.json');
    let existingMap = new Map();
    if (fs.existsSync(jsonPath)) {
      const existing = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      existingMap = new Map(existing.map((p) => [p.id, p]));
    }

    const updated = res.rows.map((r) => {
      const prev = existingMap.get(r.id) || {};
      return {
        ...prev,
        id: r.id,
        name: r.name,
        gender: r.gender || prev.gender || 'Nam',
        category: r.category || prev.category || 'ao-khoac',
        brand: r.brand || prev.brand || 'Maison',
        price: Number(r.price),
        image_url: r.image_url,
        images: [r.image_url],
        description: r.description || prev.description || '',
      };
    });

    fs.writeFileSync(jsonPath, JSON.stringify(updated, null, 2), 'utf-8');
    console.log('Updated backend/src/db/seed-products.json');

    const mlPath = path.join(rootDir, 'ml-service/data/products.json');
    if (fs.existsSync(mlPath)) {
      fs.writeFileSync(mlPath, JSON.stringify(updated, null, 2), 'utf-8');
      console.log('Updated ml-service/data/products.json');
    }

    const frontendPath = path.join(rootDir, 'frontend/src/data/products.js');
    const frontendContent = `// Danh sách 100 sản phẩm thời trang (50 Nam, 50 Nữ) độc bản, hình ảnh phân định chuẩn 100%
export const products = ${JSON.stringify(updated, null, 2)};

export const getProductById = (id) => products.find((p) => p.id === id);
`;
    fs.writeFileSync(frontendPath, frontendContent, 'utf-8');
    console.log('Updated frontend/src/data/products.js');
  } finally {
    client.release();
    await pool.end();
  }
}

sync().catch(console.error);
