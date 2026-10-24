import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import Database from './node_modules/better-sqlite3/lib/index.js';

// 50 Men Photo IDs
const menIds = [
  // 12 Áo thun nam
  "1521572267360-ee0c2909d518",
  "1576566588028-4147f3842f27",
  "1583743814966-8936f5b7be1a",
  "1586790170083-2f9ceadc732d",
  "1503342394128-c104d54dba01",
  "1618354691373-d851c5c3a990",
  "1527719327859-c6ce80353573",
  "1562157873-818bc0726f68",
  "1529374255404-311a2a4f1fd9",
  "1581655353564-df123a1eb820",
  "1521485714898-f097eb6fc5b9",
  "1579038773867-044c48829161",

  // 12 Áo sơ mi nam
  "1596755094514-f87e34085b2c",
  "1598033129183-c4f50c736f10",
  "1594938298603-c8148c4dae35",
  "1621072156002-e2fccdc0b176",
  "1588359348347-9bc6cbbb689e",
  "1626497764746-6dc36546b388",
  "1603252109303-2751441dd157",
  "1492562080023-ab3db95bfbce",
  "1500648767791-00dcc994a43e",
  "1519085360753-af0119f7cbe7",
  "1506630448388-4e683c67ddb0",
  "1539571696357-5a69c17a67c6",

  // 13 Áo khoác nam
  "1551028719-00167b16eac5",
  "1548883354-7622d03aca27",
  "1516257984-b1b4d707412e",
  "1544441893-675973e31985",
  "1537109662156-fade15c5ae8e",
  "1507679799987-c73779587ccf",
  "1593030761757-71fae45fa0e7",
  "1617137984095-74e4e5e3613f",
  "1534030347209-467a5b0ad3e6",
  "1552374196-1ab2a1c593e8",
  "1488161628813-04466f872be2",
  "1490114538077-0a7f8cb49891",
  "1559551409-dadc959f76b8",

  // 13 Quần nam
  "1541099649105-f69ad21f3246",
  "1624378439575-d8705ad7ae80",
  "1473966968600-fa801b869a1a",
  "1542272604-787c3835535d",
  "1506629082955-511b1aa562c8",
  "1517445312882-bc9910d016b7",
  "1591195853828-11db59a44f6b",
  "1584308666744-24d5c474f2ae",
  "1552902865-b72c031ac5ea",
  "1600185365483-26d7a4cc7519",
  "1506794778202-cad84cf45f1d",
  "1522075469751-3a6694fb2f61",
  "1512436991641-6745cdb1723f"
];

// Load verified women IDs
const allWomenIds = JSON.parse(fs.readFileSync(path.join(rootDir, 'backend/verified_women_ids.json')));
const womenIds = allWomenIds.slice(0, 50);

console.log(`Men IDs: ${menIds.length}, Women IDs: ${womenIds.length}`);

const menNames = [
  // ao-thun (12)
  "Áo Thun Nam Cotton Basic Trắng",
  "Áo Thun Nam Polo Cổ Bẻ Xanh Navy",
  "Áo Thun Nam Oversize Đen Streetwear",
  "Áo Thun Nam Henley Cổ Gài Nút",
  "Áo Thun Nam Thể Thao Thoáng Khí Pro",
  "Áo Thun Nam Graphic Minimalist Hiện Đại",
  "Áo Thun Nam Xám Melange Cổ Tròn",
  "Áo Thun Nam Trắng Dáng Relaxed",
  "Áo Thun Nam Cổ Tròn Bo Viền Cao Cấp",
  "Áo Thun Nam Vintage Washed Xám Tro",
  "Áo Thun Nam Cổ Tim Phong Cách Casual",
  "Áo Thun Nam Street Style In Họa Tiết",

  // ao-so-mi (12)
  "Áo Sơ Mi Nam Oxford Dài Tay Trắng",
  "Áo Sơ Mi Nam Vải Đũi Linen Mát Mẻ",
  "Áo Sơ Mi Nam Slim Fit Công Sở Thanh Lịch",
  "Áo Sơ Mi Nam Tay Ngắn Cổ Cuba Retro",
  "Áo Sơ Mi Nam Kẻ Ca-rô Denim Phóng Khoáng",
  "Áo Sơ Mi Nam Xanh Pastel Chống Nhăn",
  "Áo Sơ Mi Nam Flannel Dày Dặn Thu Đông",
  "Áo Sơ Mi Nam Kẻ Sọc Dọc Trẻ Trung",
  "Áo Sơ Mi Nam Cổ Tàu Đũi Tự Nhiên",
  "Áo Sơ Mi Nam Doanh Nhân Cao Cấp",
  "Áo Sơ Mi Nam Lụa Satin Dự Tiệc Tối",
  "Áo Sơ Mi Nam Dệt Họa Tiết Chambray",

  // ao-khoac (13)
  "Áo Khoác Da Biker Nam Cá Tính Cực Ngầu",
  "Áo Khoác Bomber Nam Phối Màu Trẻ Trung",
  "Áo Khoác Nam Có Nón Dù Trượt Nước",
  "Áo Khoác Măng Tô Dạ Nam Dáng Dài Ấm Áp",
  "Áo Khoác Jean Nam Trucker Phong Trần",
  "Áo Blazer Nam May Đo Phong Cách Hàn Quốc",
  "Áo Blazer Nam Form Rộng Casual Hiện Đại",
  "Áo Khoác Nam Kẻ Glen Plaid Lịch Lãm",
  "Áo Vest Nam Doanh Nhân Màu Xám Than",
  "Áo Khoác Gió Nam Thể Thao Cản Gió Siêu Nhẹ",
  "Áo Khoác Safari Nam Phong Cách Utility",
  "Áo Khoác Dạ Hai Hàng Khuy Cổ Điển",
  "Áo Khoác Da Lộn Nam Màu Nâu Vintage",

  // quan (13)
  "Quần Jean Nam Xanh Classic Dáng Straight",
  "Quần Jean Nam Tối Màu Slim Fit Cao Cấp",
  "Quần Chino Nam Vải Kaki Co Giãn Màu Be",
  "Quần Jean Nam Rách Xước Nhẹ Retro",
  "Quần Jogger Nam Thể Thao Bo Gấu Năng Động",
  "Quần Jean Nam Vải Raw Selvedge Bền Đẹp",
  "Quần Túi Hộp Cargo Nam Phong Cách Bụi Bặm",
  "Quần Tây Nam Xếp Ly Công Sở Lịch Lãm",
  "Quần Ống Suông Nam Rộng Thoải Mái",
  "Quần Kaki Nam Lửng Cropped Mắt Cá",
  "Quần Tây Nam Đen Dáng Slim Doanh Nhân",
  "Quần Vải Linen Nam Đũi Suông Thoáng Mát",
  "Quần Âu Nam May Đo Cao Cấp"
];

const menCategories = [
  ...Array(12).fill('ao-thun'),
  ...Array(12).fill('ao-so-mi'),
  ...Array(13).fill('ao-khoac'),
  ...Array(13).fill('quan')
];

const womenNames = [
  // vay-dam (14)
  "Đầm Midi Nữ Xòe Dáng Dài Thanh Lịch",
  "Váy Nữ Hoa Nhí Phong Cách Bohemian",
  "Đầm Dạ Hội Nữ Cúp Ngực Quyến Rũ",
  "Đầm Đỏ Nữ Dự Tiệc Đính Nơ Sang Trọng",
  "Váy Hai Dây Nữ Lụa Satin Quyến Rũ",
  "Đầm Chấm Bi Nữ Cổ Điển Vintage",
  "Đầm Nữ Xòe Chữ A Dự Tiệc Cocktail",
  "Váy Trắng Nữ Đi Biển Hở Lưng Mùa Hè",
  "Đầm Suông Nữ Lụa Phối Ren Duyên Dáng",
  "Đầm Maxi Nữ Tầng Xếp Dạo Phố",
  "Váy Nữ Vải Đũi Linen Thắt Nơ Lưng",
  "Đầm Voan Nữ Bồng Bềnh Nữ Tính",
  "Đầm Blazer Nữ Thanh Lịch Hiện Đại",
  "Váy Ôm Body Nữ Dệt Kim Tôn Dáng",

  // ao-so-mi & blouse (10)
  "Áo Sơ Mi Nữ Lụa Vàng Sang Trọng",
  "Áo Sơ Mi Nữ Trắng Công Sở Dáng Chuẩn",
  "Áo Blouse Nữ Cổ Chữ V Tinh Tế",
  "Áo Sơ Mi Nữ Vải Đũi Cổ Đức Nhẹ Nhàng",
  "Áo Blouse Nữ Họa Tiết Hoa Nhí",
  "Áo Sơ Mi Nữ Form Rộng Phong Cách Boyfriend",
  "Áo Blouse Nữ Phối Nơ Cổ Duyên Dáng",
  "Áo Sơ Mi Nữ Kẻ Sọc Công Sở Trẻ Trung",
  "Áo Kiểu Nữ Xếp Ly Tay Bồng Nữ Tính",
  "Áo Sơ Mi Nữ Croptop Cá Tính Mùa Hè",

  // ao-thun & top (10)
  "Áo Thun Nữ Graphic Năng Động Phong Cách",
  "Áo Thun Nữ Neon Phối Màu Nổi Bật",
  "Áo Thun Nữ Cotton Hữu Cơ Basic Trắng",
  "Áo Thun Nữ Cổ Lọ Dệt Kim Mềm Mịn",
  "Áo Thun Nữ Pastel Cổ Tròn Nữ Tính",
  "Áo Tập Nữ Thể Thao Thoáng Khí Ôm Dáng",
  "Áo Thun Nữ Rộng Phong Cách Hàn Quốc",
  "Áo Thun Nữ Cổ Tim Bo Gân Nhẹ Nhàng",
  "Áo Ba Lỗ Nữ Thun Gân Năng Động",
  "Áo Thun Nữ Dài Tay Dệt Kim Mùa Thu",

  // ao-khoac (8)
  "Áo Măng Tô Dạ Nữ Màu Be Dáng Dài",
  "Áo Khoác Phao Nữ Đại Hàn Siêu Nhẹ Siêu Ấm",
  "Áo Khoác Jean Nữ Croptop Bụi Bặm",
  "Áo Cardigan Nữ Dệt Kim Mềm Dáng Rộng",
  "Áo Khoác Trench Coat Nữ 2 Hàng Khuy Chuẩn Anh",
  "Áo Khoác Nữ Phối Lông Ấm Áp Mùa Đông",
  "Áo Khoác Lông Cừu Nữ Dễ Thương Ấm Áp",
  "Áo Blazer Nữ Tone Pastel Công Sở Hack Dáng",

  // quan & chan-vay (8)
  "Quần Tây Nữ Ống Rộng Lưng Cao Tôn Dáng",
  "Chân Váy Nữ Xếp Ly Dài Sang Trọng",
  "Chân Váy Lụa Satin Nữ Dáng Suông Dài",
  "Chân Váy Nữ Chữ A Dạ Kẻ Caro Trẻ Trung",
  "Quần Jean Nữ Ống Đứng Cạp Cao Xanh Sáng",
  "Quần Nữ Ống Rộng Vải Linen Thoáng Mát",
  "Quần Jean Skinny Nữ Co Giãn Siêu Hack Chân",
  "Quần Tây Nữ Dáng Lửng Thời Thượng"
];

const womenCategories = [
  ...Array(14).fill('vay-dam'),
  ...Array(10).fill('ao-so-mi'),
  ...Array(10).fill('ao-thun'),
  ...Array(8).fill('ao-khoac'),
  ...Array(8).fill('quan')
];

const products = [];

// Generate Men Products (p01 - p50)
for (let i = 0; i < 50; i++) {
  const num = (i + 1).toString().padStart(2, '0');
  const id = `p${num}`;
  const photoId = menIds[i];
  const url = `https://images.unsplash.com/photo-${photoId}?w=600&auto=format&fit=crop&q=80`;
  const name = menNames[i];
  const category = menCategories[i];
  const basePrice = 280000 + (i * 23000) % 750000;
  const price = Math.round(basePrice / 10000) * 10000;
  const hasSale = i % 3 === 0;
  const oldPrice = hasSale ? Math.round((price * 1.25) / 10000) * 10000 : null;

  products.push({
    id,
    name,
    gender: 'Nam',
    category,
    brand: 'Maison',
    price,
    oldPrice,
    stock: 80 + (i * 7) % 120,
    rating: +(4.2 + ((i * 3) % 8) / 10).toFixed(1),
    avg_rating: +(4.2 + ((i * 3) % 8) / 10).toFixed(1),
    review_count: 10 + (i * 9) % 80,
    colors: ["den", "trang", "xanh", "xam"].slice(0, 2 + (i % 3)),
    sizes: category === 'quan' ? ["29", "30", "31", "32", "33"] : ["S", "M", "L", "XL"],
    image_url: url,
    images: [url],
    isNew: i % 4 === 0,
    isFeatured: i % 5 === 0,
    description: `Thiết kế thời trang nam cao cấp từ Maison. Chất vải dày dặn, phom dáng chuẩn chỉ, tôn vóc dáng mạnh mẽ và lịch lãm cho phái mạnh.`
  });
}

// Generate Women Products (p51 - p100)
for (let i = 0; i < 50; i++) {
  const num = (i + 51).toString().padStart(2, '0');
  const id = `p${num}`;
  const photoId = womenIds[i];
  const url = `https://images.unsplash.com/photo-${photoId}?w=600&auto=format&fit=crop&q=80`;
  const name = womenNames[i];
  const category = womenCategories[i];
  const basePrice = 320000 + (i * 29000) % 850000;
  const price = Math.round(basePrice / 10000) * 10000;
  const hasSale = i % 3 === 1;
  const oldPrice = hasSale ? Math.round((price * 1.3) / 10000) * 10000 : null;

  products.push({
    id,
    name,
    gender: 'Nữ',
    category,
    brand: 'Maison',
    price,
    oldPrice,
    stock: 70 + (i * 11) % 100,
    rating: +(4.3 + ((i * 2) % 7) / 10).toFixed(1),
    avg_rating: +(4.3 + ((i * 2) % 7) / 10).toFixed(1),
    review_count: 12 + (i * 8) % 95,
    colors: ["trang", "be", "hong", "den", "xanh"].slice(0, 2 + (i % 4)),
    sizes: category === 'quan' ? ["26", "27", "28", "29", "30"] : ["XS", "S", "M", "L"],
    image_url: url,
    images: [url],
    isNew: i % 4 === 1,
    isFeatured: i % 5 === 2,
    description: `Thiết kế thời trang nữ duyên dáng từ Maison. Phom dáng tôn đường nét thanh lịch của phái đẹp, chất liệu mềm mại, thoáng mát và sang trọng trong mọi hoàn cảnh.`
  });
}

console.log(`Generated ${products.length} products total.`);

// 1. Write frontend/src/data/products.js
const frontendContent = `// Danh sách 100 sản phẩm thời trang (50 Nam, 50 Nữ) độc bản, hình ảnh phân định chuẩn 100%
export const products = ${JSON.stringify(products, null, 2)};

export const getProductById = (id) => products.find((p) => p.id === id);
`;
fs.writeFileSync(path.join(rootDir, 'frontend/src/data/products.js'), frontendContent, 'utf-8');
console.log('Updated frontend/src/data/products.js');

// 2. Write backend/src/db/seed-products.json
fs.writeFileSync(path.join(rootDir, 'backend/src/db/seed-products.json'), JSON.stringify(products, null, 2), 'utf-8');
console.log('Updated backend/src/db/seed-products.json');

// 3. Write ml-service/data/products.json
fs.writeFileSync(path.join(rootDir, 'ml-service/data/products.json'), JSON.stringify(products, null, 2), 'utf-8');
console.log('Updated ml-service/data/products.json');

// 4. Update SQLite database backend/src/db/sttn.db
const dbPath = path.join(rootDir, 'backend/src/db/sttn.db');
if (fs.existsSync(dbPath)) {
  const db = new Database(dbPath);
  console.log('Connected to SQLite DB at', dbPath);
  
  db.prepare("DELETE FROM products").run();

  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, name, description, category, brand, price, stock, image_url, avg_rating, gender
    ) VALUES (
      @id, @name, @description, @category, @brand, @price, @stock, @image_url, @avg_rating, @gender
    )
  `);

  const insertMany = db.transaction((items) => {
    for (const p of items) {
      insertStmt.run({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stock: p.stock,
        image_url: p.image_url,
        avg_rating: p.avg_rating,
        gender: p.gender
      });
    }
  });

  insertMany(products);
  console.log(`Updated SQLite database: inserted ${products.length} products.`);
  db.close();
}

// 5. Generate seed_100_products_and_reviews.sql for PostgreSQL
let sql = `
-- Xoá dữ liệu cũ
DELETE FROM reviews;
DELETE FROM products;

-- Nạp 100 sản phẩm mới
`;

for (const p of products) {
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

for (let i = 0; i < 100; i++) {
  const pId = products[i].id;
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

console.log('SUCCESS: All files generated and databases prepared!');
