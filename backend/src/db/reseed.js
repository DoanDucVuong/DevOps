const fs = require('fs')
const path = require('path')
const db = require('./index')

async function reseed() {
  await db.init()
  const file = path.join(__dirname, 'seed-products.json')
  if (!fs.existsSync(file)) {
    console.error('[reseed] Không tìm thấy file seed-products.json')
    process.exit(1)
  }

  const products = JSON.parse(fs.readFileSync(file, 'utf-8'))
  let updated = 0
  let inserted = 0

  for (const p of products) {
    const existing = await db.one('SELECT id FROM products WHERE id = ?', [p.id])
    if (existing) {
      await db.query(
        `UPDATE products 
         SET name = ?, description = ?, category = ?, brand = ?, price = ?, image_url = ?, avg_rating = ?, gender = ?
         WHERE id = ?`,
        [p.name, p.description, p.category, p.brand, p.price, p.image_url, p.avg_rating || 4.5, p.gender || 'Nam', p.id]
      )
      updated++
    } else {
      await db.query(
        `INSERT INTO products (id, name, description, category, brand, price, image_url, avg_rating, gender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.name, p.description, p.category, p.brand, p.price, p.image_url, p.avg_rating || 4.5, p.gender || 'Nam']
      )
      inserted++
    }
  }

  console.log(`[reseed] Hoàn tất nạp lại dữ liệu: Đã cập nhật ${updated} sản phẩm, bổ sung ${inserted} sản phẩm.`)
  process.exit(0)
}

reseed().catch((err) => {
  console.error('[reseed error]:', err)
  process.exit(1)
})
