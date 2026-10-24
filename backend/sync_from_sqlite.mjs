import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from './node_modules/better-sqlite3/lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Read all rows from SQLite
const db = new Database(path.join(rootDir, 'backend/src/db/sttn.db'));
const sqliteRows = db.prepare('SELECT * FROM products').all();
console.log(`Read ${sqliteRows.length} products from SQLite.`);

// 2. Read existing json structure to preserve rich fields (colors, sizes, etc.)
const existingProducts = JSON.parse(fs.readFileSync(path.join(rootDir, 'backend/src/db/seed-products.json'), 'utf-8'));
const existingMap = new Map(existingProducts.map(p => [p.id, p]));

const updatedProducts = sqliteRows.map(row => {
  const prev = existingMap.get(row.id) || {};
  return {
    id: row.id,
    name: row.name,
    gender: row.gender || prev.gender || 'Nam',
    category: row.category || prev.category || 'ao-thun',
    brand: row.brand || prev.brand || 'Maison',
    price: Number(row.price),
    oldPrice: prev.oldPrice || null,
    stock: row.stock !== undefined ? Number(row.stock) : (prev.stock || 100),
    rating: row.avg_rating !== undefined ? Number(row.avg_rating) : (prev.rating || 4.5),
    avg_rating: row.avg_rating !== undefined ? Number(row.avg_rating) : (prev.avg_rating || 4.5),
    review_count: prev.review_count || 20,
    colors: prev.colors || ["den", "trang", "xanh"],
    sizes: prev.sizes || ["S", "M", "L", "XL"],
    image_url: row.image_url,
    images: [row.image_url],
    isNew: prev.isNew !== undefined ? prev.isNew : false,
    isFeatured: prev.isFeatured !== undefined ? prev.isFeatured : false,
    description: row.description || prev.description || ''
  };
});

// 3. Write frontend/src/data/products.js
const frontendContent = `// Danh sách 100 sản phẩm thời trang (50 Nam, 50 Nữ) độc bản, hình ảnh phân định chuẩn 100%
export const products = ${JSON.stringify(updatedProducts, null, 2)};

export const getProductById = (id) => products.find((p) => p.id === id);
`;
fs.writeFileSync(path.join(rootDir, 'frontend/src/data/products.js'), frontendContent, 'utf-8');
console.log('Updated frontend/src/data/products.js');

// 4. Write backend/src/db/seed-products.json
fs.writeFileSync(path.join(rootDir, 'backend/src/db/seed-products.json'), JSON.stringify(updatedProducts, null, 2), 'utf-8');
console.log('Updated backend/src/db/seed-products.json');

// 5. Write ml-service/data/products.json
fs.writeFileSync(path.join(rootDir, 'ml-service/data/products.json'), JSON.stringify(updatedProducts, null, 2), 'utf-8');
console.log('Updated ml-service/data/products.json');

// 6. Update seed_100_products_and_reviews.sql
let sql = `
-- Xoá dữ liệu cũ
DELETE FROM reviews;
DELETE FROM products;

-- Nạp 100 sản phẩm mới
`;

for (const p of updatedProducts) {
  const id = p.id;
  const name = p.name.replace(/'/g, "''");
  const gender = p.gender;
  const category = p.category;
  const brand = p.brand;
  const price = p.price;
  const stock = p.stock;
  const avgRating = p.avg_rating;
  const imageUrl = p.image_url;
  const description = p.description.replace(/'/g, "''");

  sql += `INSERT INTO products (id, name, description, category, brand, price, stock, image_url, avg_rating, gender)
VALUES ('${id}', '${name}', '${description}', '${category}', '${brand}', ${price}, ${stock}, '${imageUrl}', ${avgRating}, '${gender}');\n`;
}

// Generate reviews
sql += `\n-- Thêm đánh giá mẫu\n`;
const reviewerNames = [
  "Nguyễn Văn An", "Trần Thị Mai", "Lê Hoàng Nam", "Phạm Quỳnh Chi",
  "Vũ Đình Trọng", "Đặng Thuỳ Linh", "Bùi Minh Đức", "Hoàng Kim Ngân"
];
const sampleComments = [
  "Sản phẩm rất đẹp, vải mịn mát, mặc vừa vặn tuyệt vời!",
  "Giao hàng nhanh, đóng gói cẩn thận, đúng như hình ảnh mô tả.",
  "Chất lượng tốt so với tầm giá, sẽ tiếp tục ủng hộ shop.",
  "Rất ưng ý, phom dáng chuẩn, màu sắc nhã nhặn lịch thiệp.",
  "Mua lần thứ hai rồi, chất vải dày dặn không bai xù khi giặt."
];

for (let i = 0; i < updatedProducts.length; i++) {
  const pId = updatedProducts[i].id;
  const count = 1 + (i % 3);
  for (let c = 0; c < count; c++) {
    const uName = reviewerNames[(i + c) % reviewerNames.length];
    const rating = 4 + (c % 2);
    const comment = sampleComments[(i + c) % sampleComments.length];
    sql += `INSERT INTO reviews (product_id, user_name, rating, comment, created_at)
VALUES ('${pId}', '${uName}', ${rating}, '${comment}', NOW() - INTERVAL '${(i * 3 + c)} DAYS');\n`;
  }
}

fs.writeFileSync(path.join(rootDir, 'seed_100_products_and_reviews.sql'), sql, 'utf-8');
console.log('Updated seed_100_products_and_reviews.sql');

console.log('Sync finished successfully!');
