const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { query, one, usePg } = require('../db')

let Database = null
try {
  Database = require('better-sqlite3')
} catch (e) {
  console.warn('[syncService] better-sqlite3 không sẵn có, bỏ qua sync SQLite trực tiếp:', e.message)
}

/**
 * Tìm tất cả các đường dẫn tồn tại hoặc có thể ghi
 */
function resolveCandidatePaths(subPath) {
  const candidates = [
    path.resolve(__dirname, '../../..', subPath), // Khi chạy trực tiếp trên host Node
    path.resolve(__dirname, '../..', subPath),
    path.resolve('/app', subPath),                // Khi chạy trong Docker container có mount
    path.resolve('/', subPath)
  ]
  return candidates
}

function writeFirstValid(subPaths, content) {
  for (const sp of subPaths) {
    for (const p of resolveCandidatePaths(sp)) {
      try {
        const dir = path.dirname(p)
        if (fs.existsSync(dir)) {
          fs.writeFileSync(p, content, 'utf8')
          console.log(`[syncService] Đã cập nhật file: ${p}`)
          return true
        }
      } catch (err) {
        // continue trying
      }
    }
  }
  return false
}

/**
 * Tự động đồng bộ hóa toàn diện khi Admin Thêm / Sửa / Xóa sản phẩm:
 * 1. Lấy dữ liệu sản phẩm mới nhất từ DB chính (PostgreSQL hoặc SQLite)
 * 2. Cập nhật sang DB phụ (sttn.db)
 * 3. Ghi đè file seed-products.json
 * 4. Ghi đè file frontend/src/data/products.js
 * 5. Ghi đè file ml-service/data/products.json
 * 6. Kích hoạt ML Service nạp lại dữ liệu (retrain)
 */
async function syncAllProductData() {
  try {
    console.log('[syncService] Bắt đầu tự động đồng bộ hóa toàn diện sản phẩm...')

    // 1. Lấy toàn bộ sản phẩm từ DB đang chạy
    const rows = await query('SELECT * FROM products ORDER BY created_at DESC, id ASC')
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

    // 2. Ghi ra seed-products.json
    const seedJson = JSON.stringify(formattedProducts, null, 2)
    const seedPaths = [
      path.join(__dirname, '../db/seed-products.json'),
      path.resolve(__dirname, '../../src/db/seed-products.json'),
      '/app/src/db/seed-products.json'
    ]
    for (const sp of seedPaths) {
      try {
        if (fs.existsSync(path.dirname(sp))) {
          fs.writeFileSync(sp, seedJson, 'utf8')
          console.log(`[syncService] Đã ghi seed file: ${sp}`)
        }
      } catch (e) {}
    }

    // 3. Đồng bộ vào SQLite sttn.db (cho Database Client extension trong IDE)
    const sqlitePaths = [
      path.join(__dirname, '../db/sttn.db'),
      path.resolve(__dirname, '../../src/db/sttn.db'),
      '/app/src/db/sttn.db'
    ]
    for (const sqlPath of sqlitePaths) {
      try {
        if (fs.existsSync(path.dirname(sqlPath))) {
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

            const currentIds = rows.map((r) => r.id)
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
              if (currentIds.length > 0) {
                const placeholders = currentIds.map(() => '?').join(',')
                db.prepare(`DELETE FROM products WHERE id NOT IN (${placeholders})`).run(...currentIds)
              }
            })
            tx(rows)
            db.close()
            console.log(`[syncService] Đã đồng bộ ${rows.length} sản phẩm sang SQLite (better-sqlite3): ${sqlPath}`)
            break
          } else {
            // Fallback sang sqlite3 CLI
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
            break
          }
        }
      } catch (e) {
        console.warn(`[syncService] Lỗi khi sync SQLite tại ${sqlPath}:`, e.message)
      }
    }

    // 4. Ghi file tĩnh Frontend: products.js
    const frontendContent = `// Danh sách ${formattedProducts.length} sản phẩm thời trang tự động đồng bộ theo thời gian thực từ Database
export const products = ${JSON.stringify(formattedProducts, null, 2)};

export const getProductById = (id) => products.find((p) => p.id === id);
`
    writeFirstValid(['frontend/src/data/products.js', 'frontend-data/products.js'], frontendContent)

    // 5. Ghi file tĩnh ML Service: products.json
    writeFirstValid(['ml-service/data/products.json', 'ml-data/products.json'], seedJson)

    // 6. Gọi API kích hoạt ML Service reload / retrain tự động
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001'
    const mlKey = process.env.INTERNAL_API_KEY || 'dev-internal-key'
    try {
      console.log(`[syncService] Kích hoạt ML Service retrain tại ${mlUrl}/retrain...`)
      await axios.post(
        `${mlUrl}/retrain`,
        {},
        {
          headers: { 'x-internal-key': mlKey },
          timeout: 4000,
        }
      )
      console.log('[syncService] ML Service đã bắt đầu cập nhật mô hình!')
    } catch (mlErr) {
      console.warn('[syncService] Không thể gọi ML Service retrain (ML service có thể đang tắt hoặc bận):', mlErr.message)
    }

    console.log('[syncService] Hoàn tất đồng bộ toàn diện thành công!')
  } catch (err) {
    console.error('[syncService] Lỗi trong quá trình đồng bộ sản phẩm:', err)
  }
}

module.exports = {
  syncAllProductData,
}
