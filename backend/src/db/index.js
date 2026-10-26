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
  const TS_NULL = usePg ? 'TIMESTAMP' : 'TEXT'
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
      review_count INTEGER DEFAULT 0,
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
    `CREATE TABLE IF NOT EXISTS reviews (
      id ${ID},
      product_id TEXT NOT NULL,
      user_id TEXT,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT NOT NULL,
      created_at ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      gender_group TEXT NOT NULL DEFAULT 'Chung',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS vouchers (
      id ${ID},
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL DEFAULT 'percent',
      discount_value ${REAL} NOT NULL,
      min_order_value ${REAL} DEFAULT 0,
      max_discount ${REAL},
      usage_limit INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      expires_at ${TS_NULL},
      created_at ${TS}
    )`,
    `CREATE TABLE IF NOT EXISTS banners (
      id ${ID},
      title TEXT NOT NULL,
      subtitle TEXT,
      image_url TEXT NOT NULL,
      cta_text TEXT DEFAULT 'Khám phá ngay',
      cta_link TEXT DEFAULT '/products',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at ${TS}
    )`,
    'CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id)',
    'CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)',
    'CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code)',
  ]
  for (const stmt of ddl) await query(stmt)
  try {
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Unisex'")
  } catch (err) {}
  try {
    await query("ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0")
  } catch (err) {
    try { await query("ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0") } catch (e) {}
  }
  try {
    await query("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id TEXT")
  } catch (err) {
    try { await query("ALTER TABLE reviews ADD COLUMN user_id TEXT") } catch (e) {}
  }

  await seedCategories()
  await seedVouchers()
  await seedBanners()
  await seedProducts()
  await seedAdmin()
  console.log(`[db] Sẵn sàng (${usePg ? 'PostgreSQL' : 'SQLite'})`)
}

async function seedProducts() {
  const row = await one('SELECT COUNT(*) AS c FROM products')
  const count = Number(row?.c || 0)

  const bundled = path.join(__dirname, 'seed-products.json')
  const sibling = path.join(__dirname, '..', '..', '..', 'ml-service', 'data', 'products.json')
  const file = fs.existsSync(bundled) ? bundled : sibling
  if (!fs.existsSync(file)) {
    console.warn('[db] Không tìm thấy file dữ liệu sản phẩm để seed.')
    return
  }
  const products = JSON.parse(fs.readFileSync(file, 'utf-8'))

  // BẢO VỆ DỮ LIỆU ĐÃ SỬA CỦA NGƯỜI DÙNG:
  // Nếu bảng đã có sản phẩm, chỉ bổ sung sản phẩm mới nếu còn thiếu.
  // TUYỆT ĐỐI KHÔNG ghi đè (UPDATE) tên, link ảnh, giá mà người dùng đã sửa trong Admin / DB.
  let inserted = 0
  for (const p of products) {
    const existing = await one('SELECT id FROM products WHERE id = ?', [p.id])
    if (!existing) {
      await query(
        `INSERT INTO products (id, name, description, category, brand, price, image_url, avg_rating, gender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.description, p.category, p.brand, p.price, p.image_url, p.avg_rating || 4.5, p.gender || 'Nam']
      )
      inserted++
    }
  }

  if (count === 0) {
    console.log(`[db] Đã khởi tạo ban đầu ${inserted} sản phẩm.`)
  } else if (inserted > 0) {
    console.log(`[db] Đã bổ sung ${inserted} sản phẩm mới thiếu vào CSDL.`)
  } else {
    console.log(`[db] Dữ liệu ${count} sản phẩm đã sẵn sàng (bảo toàn mọi chỉnh sửa tên/ảnh của người dùng).`)
  }
}

async function seedCategories() {
  const row = await one('SELECT COUNT(*) AS c FROM categories')
  if (Number(row.c) > 0) return

  const defaultCategories = [
    { id: 'ao-khoac', name: 'Áo khoác', slug: 'ao-khoac', gender_group: 'Chung', sort_order: 1 },
    { id: 'ao-so-mi', name: 'Áo sơ mi', slug: 'ao-so-mi', gender_group: 'Chung', sort_order: 2 },
    { id: 'ao-thun', name: 'Áo thun', slug: 'ao-thun', gender_group: 'Chung', sort_order: 3 },
    { id: 'quan', name: 'Quần', slug: 'quan', gender_group: 'Chung', sort_order: 4 },
    { id: 'vay-dam', name: 'Váy & Đầm', slug: 'vay-dam', gender_group: 'Nữ', sort_order: 5 },
    { id: 'phu-kien', name: 'Phụ kiện', slug: 'phu-kien', gender_group: 'Chung', sort_order: 6 },
  ]

  for (const c of defaultCategories) {
    await query(
      `INSERT INTO categories (id, name, slug, gender_group, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [c.id, c.name, c.slug, c.gender_group, c.sort_order]
    )
  }
  console.log(`[db] Đã seed ${defaultCategories.length} danh mục mặc định.`)
}

async function seedVouchers() {
  const row = await one('SELECT COUNT(*) AS c FROM vouchers')
  if (Number(row.c) > 0) return

  const defaultVouchers = [
    { code: 'MAISON10', discount_type: 'percent', discount_value: 10, min_order_value: 300000, max_discount: 100000, usage_limit: 500 },
    { code: 'GIAM50K', discount_type: 'amount', discount_value: 50000, min_order_value: 500000, max_discount: 50000, usage_limit: 200 },
    { code: 'FREESHIP', discount_type: 'amount', discount_value: 30000, min_order_value: 200000, max_discount: 30000, usage_limit: 1000 },
  ]

  for (const v of defaultVouchers) {
    await query(
      `INSERT INTO vouchers (code, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 0, 1)`,
      [v.code, v.discount_type, v.discount_value, v.min_order_value, v.max_discount, v.usage_limit]
    )
  }
  console.log(`[db] Đã seed ${defaultVouchers.length} mã voucher khuyến mãi.`)
}

async function seedBanners() {
  const row = await one('SELECT COUNT(*) AS c FROM banners')
  if (Number(row.c) > 0) return

  const defaultBanners = [
    {
      title: 'Mặc đẹp mỗi ngày, không cần cố gắng',
      subtitle: 'Maison chọn lọc những thiết kế tối giản, chất liệu bền và dễ phối, để bạn dành thời gian cho những điều quan trọng hơn tủ đồ.',
      image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
      cta_text: 'Khám phá ngay',
      cta_link: '/products',
      sort_order: 1,
      is_active: 1
    }
  ]

  for (const b of defaultBanners) {
    await query(
      `INSERT INTO banners (title, subtitle, image_url, cta_text, cta_link, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [b.title, b.subtitle, b.image_url, b.cta_text, b.cta_link, b.sort_order, b.is_active]
    )
  }
  console.log(`[db] Đã seed banner trang chủ mặc định.`)
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
