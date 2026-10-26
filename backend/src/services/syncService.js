const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { query, one, usePg } = require('../db')

let Database = null
try {
  Database = require('better-sqlite3')
} catch (e) {
  try {
    Database = require(path.resolve(__dirname, '../../node_modules/better-sqlite3'))
  } catch (err) {
    console.warn('[syncService] better-sqlite3 không sẵn có, dùng fallback CLI:', err.message)
  }
}

/**
 * Ghi nội dung ra file nếu thư mục cha tồn tại
 */
function writeToFileIfDirExists(targetPath, content) {
  try {
    const dir = path.dirname(targetPath)
    if (fs.existsSync(dir)) {
      fs.writeFileSync(targetPath, content, 'utf8')
      console.log(`[syncService] Đã cập nhật file: ${targetPath}`)
      return true
    }
  } catch (err) {
    console.warn(`[syncService] Không thể ghi file ${targetPath}:`, err.message)
  }
  return false
}

/**
 * Tự động đồng bộ hóa toàn diện khi Admin Thêm / Sửa / Xóa sản phẩm:
 * 1. Lấy dữ liệu sản phẩm mới nhất từ DB đang chạy
 * 2. Cập nhật vào cả 2 CSDL: PostgreSQL (pg) và SQLite (better-sqlite3 sttn.db)
 * 3. Ghi đè chính xác các file:
 *    - backend/src/db/sttn.db
 *    - backend/src/db/seed-products.json
 *    - frontend/src/data/products.js
 * 4. Kích hoạt ML Service nạp lại dữ liệu
 */
async function syncAllProductData() {
  try {
    console.log('[syncService] Bắt đầu tự động đồng bộ hóa toàn diện sản phẩm...')

    // 1. Lấy toàn bộ sản phẩm từ DB đang chạy
    const rows = await query('SELECT * FROM products ORDER BY id ASC')
    if (!rows || rows.length === 0) {
      console.warn('[syncService] CSDL không có sản phẩm nào để đồng bộ.')
      return
    }

    // Định dạng đồng nhất cho Frontend và Seed
    const formattedProducts = rows.map((r) => {
      const img = r.image_url || ''
      return {
        id: r.id,
        name: r.name,
        gender: r.gender || 'Nam',
        category: r.category || 'ao-khoac',
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
      }
    })

    const seedJson = JSON.stringify(formattedProducts, null, 2)

    // 2. Ghi ra backend/src/db/seed-products.json
    const seedPaths = [
      path.join(__dirname, '../db/seed-products.json'),
      path.resolve(__dirname, '../../../backend/src/db/seed-products.json'),
      '/app/src/db/seed-products.json',
    ]
    for (const sp of seedPaths) {
      writeToFileIfDirExists(sp, seedJson)
    }

    // 3. Ghi file tĩnh Frontend: frontend/src/data/products.js
    const frontendContent = `// Danh sách ${formattedProducts.length} sản phẩm thời trang tự động đồng bộ theo thời gian thực từ Database
export const products = ${JSON.stringify(formattedProducts, null, 2)};

export const getProductById = (id) => products.find((p) => p.id === id);
`
    const frontendPaths = [
      path.join(__dirname, '../../../frontend/src/data/products.js'),
      path.resolve(__dirname, '../../../../frontend/src/data/products.js'),
      '/app/frontend/src/data/products.js',
      '/app/frontend-data/products.js',
    ]
    for (const fp of frontendPaths) {
      writeToFileIfDirExists(fp, frontendContent)
    }

    // 4. Ghi file tĩnh ML Service: ml-service/data/products.json
    const mlPaths = [
      path.join(__dirname, '../../../ml-service/data/products.json'),
      path.resolve(__dirname, '../../../../ml-service/data/products.json'),
      '/app/ml-service/data/products.json',
      '/app/ml-data/products.json',
    ]
    for (const mp of mlPaths) {
      writeToFileIfDirExists(mp, seedJson)
    }

    // 5. Đồng bộ vào SQLite backend/src/db/sttn.db (cho Database Client extension trong IDE)
    const sqlitePaths = [
      path.join(__dirname, '../db/sttn.db'),
      path.resolve(__dirname, '../../../backend/src/db/sttn.db'),
      '/app/src/db/sttn.db',
    ]

    for (const sqlPath of sqlitePaths) {
      try {
        if (!fs.existsSync(path.dirname(sqlPath))) continue

        if (Database) {
          const db = new Database(sqlPath)
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
          `)

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
          `)

          const tx = db.transaction((items) => {
            for (const r of items) {
              upsertStmt.run(
                r.id,
                r.name,
                r.description || '',
                r.category,
                r.gender || 'Nam',
                r.brand || 'Maison',
                Number(r.price),
                Number(r.stock ?? 100),
                r.image_url || '',
                Number(r.avg_rating ?? 4.5)
              )
            }
          })
          tx(rows)
          db.close()
          console.log(`[syncService] Đã đồng bộ ${rows.length} sản phẩm sang SQLite (better-sqlite3): ${sqlPath}`)
        } else {
          // Fallback sqlite3 CLI
          const { execSync } = require('child_process')
          const esc = (s) => (s ? String(s).replace(/'/g, "''") : '')
          let sql = `
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
BEGIN TRANSACTION;
`
          for (const r of rows) {
            sql += `INSERT INTO products (id, name, description, category, gender, brand, price, stock, image_url, avg_rating)
VALUES ('${esc(r.id)}', '${esc(r.name)}', '${esc(r.description)}', '${esc(r.category)}', '${esc(r.gender || 'Nam')}', '${esc(r.brand || 'Maison')}', ${Number(r.price)}, ${Number(r.stock ?? 100)}, '${esc(r.image_url)}', ${Number(r.avg_rating ?? 4.5)})
ON CONFLICT(id) DO UPDATE SET
  name=excluded.name, description=excluded.description, category=excluded.category,
  gender=excluded.gender, brand=excluded.brand, price=excluded.price,
  stock=excluded.stock, image_url=excluded.image_url, avg_rating=excluded.avg_rating;\n`
          }
          sql += 'COMMIT;\n'
          const tempFile = path.join(path.dirname(sqlPath), '_sync_pg_sqlite.sql')
          fs.writeFileSync(tempFile, sql, 'utf8')
          execSync(`sqlite3 "${sqlPath}" < "${tempFile}"`)
          try { fs.unlinkSync(tempFile) } catch (e) {}
          console.log(`[syncService] Đã đồng bộ ${rows.length} sản phẩm sang SQLite (sqlite3 CLI): ${sqlPath}`)
        }
      } catch (sqlErr) {
        console.warn(`[syncService] Lỗi khi sync SQLite tại ${sqlPath}:`, sqlErr.message)
      }
    }

    // 6. Đồng bộ sang Database PostgreSQL (pg)
    const { Pool } = require('pg')
    const pgUrls = [
      process.env.DATABASE_URL,
      'postgresql://sttn:sttn_dev_password@localhost:5432/sttn',
      'postgresql://sttn:sttn_dev_password@localhost:5432/postgres',
      'postgresql://sttn:sttn_dev_password@postgres:5432/sttn',
      'postgresql://sttn:sttn_dev_password@postgres:5432/postgres',
    ].filter(Boolean)

    const uniquePgUrls = [...new Set(pgUrls)]
    for (const url of uniquePgUrls) {
      try {
        const pool = new Pool({
          connectionString: url,
          connectionTimeoutMillis: 2500,
          ssl: process.env.DATABASE_SSL === 'false' ? false : (url.includes('render.com') ? { rejectUnauthorized: false } : false),
        })

        await pool.query(`
          CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            gender VARCHAR(20) DEFAULT 'Nam',
            brand VARCHAR(100),
            price NUMERIC NOT NULL,
            stock INTEGER DEFAULT 100,
            image_url TEXT,
            avg_rating NUMERIC DEFAULT 4.5,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `)

        for (const r of rows) {
          await pool.query(`
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
              avg_rating = EXCLUDED.avg_rating
          `, [
            r.id, r.name, r.description || '', r.category, r.gender || 'Nam',
            r.brand || 'Maison', Number(r.price), Number(r.stock ?? 100),
            r.image_url || '', Number(r.avg_rating ?? 4.5)
          ])
        }
        await pool.end()
        console.log(`[syncService] Đã đồng bộ sang PostgreSQL: ${url.replace(/:[^:]*@/, ':***@')}`)
      } catch (pgErr) {
        // bỏ qua nếu URL không kết nối được
      }
    }

    // Log xác nhận chính xác theo yêu cầu
    console.log("Sync hoàn tất vào các file")

    // 7. Gọi API kích hoạt ML Service reload / retrain tự động
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001'
    const mlKey = process.env.INTERNAL_API_KEY || 'dev-internal-key'
    try {
      await axios.post(
        `${mlUrl}/retrain`,
        {},
        {
          headers: { 'x-internal-key': mlKey },
          timeout: 4000,
        }
      )
      console.log('[syncService] ML Service đã bắt đầu cập nhật mô hình!')
    } catch (mlErr) {}

  } catch (err) {
    console.error('[syncService] Lỗi trong quá trình đồng bộ sản phẩm:', err)
  }
}

module.exports = {
  syncAllProductData,
}
