/**
 * Lớp truy cập dữ liệu — hỗ trợ 2 engine với cùng một bộ SQL:
 *  - PostgreSQL: khi có biến môi trường DATABASE_URL (dùng cho Render / docker-compose / production)
 *  - SQLite    : khi KHÔNG có DATABASE_URL (chạy local, không cần cài DB server)
 *
 * Quy ước viết SQL trong routes: dùng dấu `?` làm placeholder, hàm query() tự đổi sang $1,$2...
 * cho PostgreSQL. Không dùng dấu `?` bên trong chuỗi ký tự của câu SQL.
 */
const path = require('path')
const fs = require('fs')
const bcrypt = require('bcryptjs')

const usePg = Boolean(process.env.DATABASE_URL)
let pool = null
let sqlite = null

if (usePg) {
  const { Pool, types } = require('pg')
  // COUNT/SUM trả về bigint (OID 20) và NUMERIC (1700) dạng chuỗi -> ép về số
  types.setTypeParser(20, (v) => parseInt(v, 10))
  types.setTypeParser(1700, (v) => parseFloat(v))
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
  })
} else {
  const Database = require('better-sqlite3')
  sqlite = new Database(path.join(__dirname, 'sttn.db'))
  sqlite.pragma('journal_mode = WAL')
}

const toPg = (sql) => {
  let i = 0
  return sql.replace(/\?/g, () => `$${++i}`)
}

/** Chạy SQL, luôn trả về mảng các dòng (rows). Hỗ trợ INSERT ... RETURNING. */
async function query(sql, params = []) {
  const safe = params.map((p) => (p === undefined ? null : p))
  if (usePg) {
    const result = await pool.query(toPg(sql), safe)
    return result.rows
  }
  const stmt = sqlite.prepare(sql)
  if (stmt.reader) return stmt.all(...safe)
  stmt.run(...safe)
  return []
}

async function one(sql, params = []) {
  const rows = await query(sql, params)
  return rows[0] || null
}

async function init() {
  const ID = usePg ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'
  const TS = usePg ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'TEXT DEFAULT CURRENT_TIMESTAMP'
  const REAL = usePg ? 'DOUBLE PRECISION' : 'REAL'

  const ddl = [
    `CREATE TABLE IF NOT EXISTS users (
      id ${ID},
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      created_at ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      gender TEXT DEFAULT 'Unisex',
      brand TEXT,
      price ${REAL} NOT NULL,
      stock INTEGER DEFAULT 100,
      image_url TEXT,
      avg_rating ${REAL} DEFAULT 0,
      created_at ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS interactions (
      id ${ID},
      user_id TEXT,
      product_id TEXT NOT NULL,
      interaction_type TEXT NOT NULL CHECK(interaction_type IN ('view','cart','purchase','rating')),
      rating_value INTEGER,
      timestamp ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id ${ID},
      user_id TEXT NOT NULL,
      total_amount ${REAL} NOT NULL,
      shipping_fee ${REAL} NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','completed','cancelled')),
      payment_method TEXT,
      shipping_json TEXT,
      items_json TEXT NOT NULL,
      created_at ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS recommendation_log (
      id ${ID},
      user_id TEXT,
      product_id TEXT NOT NULL,
      algorithm TEXT NOT NULL,
      is_clicked INTEGER DEFAULT 0,
      created_at ${TS}
    )`,
    'CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)',
  ]
  for (const stmt of ddl) await query(stmt)
  try {
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Unisex'")
  } catch (err) {
    // Bỏ qua nếu cột đã tồn tại hoặc SQLite không hỗ trợ IF NOT EXISTS
  }

  await seedProducts()
  await seedAdmin()
  console.log(`[db] Sẵn sàng (${usePg ? 'PostgreSQL' : 'SQLite'})`)
}

async function seedProducts() {
  const row = await one('SELECT COUNT(*) AS c FROM products')
  if (Number(row.c) > 0) return

  // Ưu tiên bản copy đóng gói sẵn (Docker), fallback sang ml-service/data khi chạy monorepo local
  const bundled = path.join(__dirname, 'seed-products.json')
  const sibling = path.join(__dirname, '..', '..', '..', 'ml-service', 'data', 'products.json')
  const file = fs.existsSync(bundled) ? bundled : sibling
  if (!fs.existsSync(file)) {
    console.warn('[db] Không tìm thấy file dữ liệu sản phẩm để seed.')
    return
  }
  const products = JSON.parse(fs.readFileSync(file, 'utf-8'))
  for (const p of products) {
    await query(
      `INSERT INTO products (id, name, description, category, brand, price, image_url, avg_rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.name, p.description, p.category, p.brand, p.price,
        `https://picsum.photos/seed/${p.id}/600/800`, +(3.8 + Math.random() * 1.2).toFixed(1)]
    )
  }
  console.log(`[db] Đã seed ${products.length} sản phẩm.`)
}

async function seedAdmin() {
  const admin = await one('SELECT id FROM users WHERE email = ?', ['admin@sttn.vn'])
  if (admin) return
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  await query(
    `INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, 'admin')`,
    ['Quản trị viên', 'admin@sttn.vn', bcrypt.hashSync(password, 10)]
  )
  console.log('[db] Đã tạo tài khoản admin: admin@sttn.vn')
}

module.exports = { query, one, init, usePg }
