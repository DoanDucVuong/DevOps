const db = require('./src/db')
const { syncAllProductData } = require('./src/services/syncService')

const accessories = [
  {
    id: 'p102',
    name: 'Mũ Lưỡi Trai Classic Twill Maison',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 290000,
    stock: 65,
    sold_count: 24,
    avg_rating: 4.8,
    review_count: 8,
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
    description: 'Mũ lưỡi trai phong cách tối giản từ chất liệu cotton twill 100% cao cấp, form cứng cáp, khóa kim loại khắc logo Maison sắc sảo, chống nắng và thoáng khí tối đa.'
  },
  {
    id: 'p103',
    name: 'Mũ Bucket Canvas Minimalist Unisex',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 320000,
    stock: 50,
    sold_count: 19,
    avg_rating: 4.7,
    review_count: 6,
    image_url: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80',
    description: 'Mũ bucket vải canvas cotton tự nhiên bền bỉ, phong cách dạo phố trẻ trung, vành mũ chuẩn độ rộng che nắng hiệu quả và dễ dàng gấp gọn mang theo.'
  },
  {
    id: 'p104',
    name: 'Thắt Lưng Nam Da Bò Thật Khóa Kim Loại Mờ',
    category: 'phu-kien',
    gender: 'Nam',
    brand: 'Maison',
    price: 480000,
    stock: 70,
    sold_count: 42,
    avg_rating: 4.9,
    review_count: 15,
    image_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    description: 'Thắt lưng nam chế tác từ da bò nguyên tấm cao cấp nhập khẩu, bề mặt da mềm mịn bền màu theo thời gian, kết hợp khóa hợp kim mạ mờ sang trọng cho quý ông.'
  },
  {
    id: 'p105',
    name: 'Thắt Lưng Nữ Bản Nhỏ Da Ý Thanh Lịch',
    category: 'phu-kien',
    gender: 'Nữ',
    brand: 'Maison',
    price: 390000,
    stock: 45,
    sold_count: 28,
    avg_rating: 4.8,
    review_count: 9,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Thắt lưng nữ bản nhỏ 1.8cm tôn dáng vòng eo, phối cùng đầm dài hoặc quần tây công sở thanh thoát. Mặt khóa mạ vàng ánh kim tinh xảo chuẩn phong cách Pháp.'
  },
  {
    id: 'p106',
    name: 'Ví Da Nam Dáng Ngang Saffiano Cao Cấp',
    category: 'phu-kien',
    gender: 'Nam',
    brand: 'Maison',
    price: 550000,
    stock: 55,
    sold_count: 35,
    avg_rating: 5.0,
    review_count: 12,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    description: 'Ví gập da saffiano chống trầy xước và kháng nước nhẹ, thiết kế 8 ngăn thẻ tiện lợi, 2 ngăn tiền rộng rãi và ngăn khóa kéo an toàn. Đẳng cấp thời trang doanh nhân.'
  },
  {
    id: 'p107',
    name: 'Ví Cầm Tay Nữ Da Thuần Chay Đa Năng',
    category: 'phu-kien',
    gender: 'Nữ',
    brand: 'Maison',
    price: 460000,
    stock: 40,
    sold_count: 22,
    avg_rating: 4.7,
    review_count: 7,
    image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=800&q=80',
    description: 'Ví dài cầm tay nữ da vegan thân thiện môi trường với vân da tự nhiên, nhiều ngăn đựng điện thoại, tiền mặt và son môi nhỏ gọn khi đi tiệc hoặc cà phê dạo phố.'
  },
  {
    id: 'p108',
    name: 'Túi Tote Canvas Đựng Laptop Phong Cách Maison',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 340000,
    stock: 80,
    sold_count: 58,
    avg_rating: 4.9,
    review_count: 21,
    image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    description: 'Túi tote chất vải canvas dày dặn 12oz, có khóa kéo miệng và ngăn lót riêng cho laptop 14 inch, quai xách may chỉ đôi chịu tải trọng tốt, phong cách retro thanh lịch.'
  },
  {
    id: 'p109',
    name: 'Túi Đeo Chéo Mini Crossbody Da Mềm',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 520000,
    stock: 60,
    sold_count: 36,
    avg_rating: 4.8,
    review_count: 14,
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    description: 'Túi đeo chéo form hộp hiện đại từ da tổng hợp vi sợi siêu mềm dai, khóa từ tiện dụng và dây đeo bản rộng có thể điều chỉnh linh hoạt mọi vóc dáng.'
  },
  {
    id: 'p110',
    name: 'Kính Mát Unisex Gọng Vuông Titanium UV400',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 590000,
    stock: 35,
    sold_count: 18,
    avg_rating: 4.9,
    review_count: 11,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    description: 'Kính mát tròng polarized phân cực chống chói loá và cản 100% tia cực tím UV400, gọng titanium siêu nhẹ ôm sát khuôn mặt không gây vết hằn sống mũi.'
  },
  {
    id: 'p111',
    name: 'Set 3 Đôi Tất Cổ Cao Cotton Kháng Khuẩn',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 160000,
    stock: 120,
    sold_count: 89,
    avg_rating: 4.9,
    review_count: 35,
    image_url: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
    description: 'Set 3 đôi vớ cổ cao dệt sợi cotton chải kỹ kết hợp công nghệ ion bạc kháng khuẩn khử mùi, độ đàn hồi ôm vừa vặn gót chân không bai dão sau nhiều lần giặt.'
  },
  {
    id: 'p112',
    name: 'Set 3 Đôi Tất Lười Cổ Ngắn Chống Tụt Gót',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 140000,
    stock: 100,
    sold_count: 73,
    avg_rating: 4.8,
    review_count: 26,
    image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    description: 'Set 3 đôi tất tàng hình cổ ngắn thiết kế đệm silicon gót chân chống tụt tuyệt đối khi di chuyển, chất liệu cotton mỏng nhẹ thoáng khí chuyên dùng cho giày lười và sneaker.'
  },
  {
    id: 'p113',
    name: 'Khăn Choàng Cổ Dệt Kim Cashmere Blend',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 620000,
    stock: 30,
    sold_count: 17,
    avg_rating: 5.0,
    review_count: 8,
    image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
    description: 'Khăn choàng dệt kim pha len cashmere mềm mịn ấm áp, tua rua đan tay thủ công tỉ mỉ, bảng màu trung tính trang nhã phù hợp cả nam và nữ trong mùa thu đông.'
  },
  {
    id: 'p114',
    name: 'Vòng Tay Da Đan Khóa Nam Châm Bạc Maison',
    category: 'phu-kien',
    gender: 'Nam',
    brand: 'Maison',
    price: 310000,
    stock: 40,
    sold_count: 29,
    avg_rating: 4.8,
    review_count: 10,
    image_url: 'https://images.unsplash.com/photo-1611591475819-79b8b73ff2f9?auto=format&fit=crop&w=800&q=80',
    description: 'Phụ kiện nam tinh tế với dây da bò bện xoắn thủ công, chốt khóa nam châm thép không gỉ 316L sáng bóng khắc chữ lồng Maison độc quyền.'
  },
  {
    id: 'p115',
    name: 'Balo Vải Oxford Cao Cấp Chống Trượt Nước',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 820000,
    stock: 35,
    sold_count: 45,
    avg_rating: 4.9,
    review_count: 18,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Balo thời trang đa dụng với chất vải Oxford 900D kháng nước vượt trội, đệm lưng công thái học tổ ong thoáng khí, ngăn chứa laptop 15.6 inch chống sốc dày dặn.'
  },
  {
    id: 'p116',
    name: 'Ví Kẹp Thẻ Mini Cardholder Da Epi Maison',
    category: 'phu-kien',
    gender: 'Unisex',
    brand: 'Maison',
    price: 280000,
    stock: 55,
    sold_count: 39,
    avg_rating: 4.8,
    review_count: 12,
    image_url: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=800&q=80',
    description: 'Ví kẹp thẻ siêu mỏng gọn da Epi dập vân sắc nét, tích hợp 6 khe cắm thẻ và 1 ngăn giữa để tiền gập, tiện lợi bỏ túi áo sơ mi hoặc túi quần tây mà không gây cộm.'
  }
]

async function seed() {
  await db.init()
  console.log('[seed_accessories] Bắt đầu chèn sản phẩm phụ kiện...')

  let inserted = 0
  let updated = 0

  for (const item of accessories) {
    const existing = await db.one('SELECT id FROM products WHERE id = ?', [item.id])
    if (existing) {
      await db.query(
        `UPDATE products 
         SET name = ?, description = ?, category = ?, gender = ?, brand = ?, price = ?, stock = ?, image_url = ?, avg_rating = ?, review_count = ?, sold_count = ?
         WHERE id = ?`,
        [
          item.name,
          item.description,
          item.category,
          item.gender,
          item.brand,
          item.price,
          item.stock,
          item.image_url,
          item.avg_rating,
          item.review_count,
          item.sold_count,
          item.id
        ]
      )
      updated++
    } else {
      await db.query(
        `INSERT INTO products (id, name, description, category, gender, brand, price, stock, image_url, avg_rating, review_count, sold_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.name,
          item.description,
          item.category,
          item.gender,
          item.brand,
          item.price,
          item.stock,
          item.image_url,
          item.avg_rating,
          item.review_count,
          item.sold_count
        ]
      )
      inserted++
    }
  }

  console.log(`[seed_accessories] Đã thêm ${inserted} sản phẩm mới, cập nhật ${updated} sản phẩm vào Database.`)

  // Đồng bộ hóa toàn diện sang file tĩnh Frontend, Seed JSON, và ML Service
  try {
    await syncAllProductData()
    console.log('[seed_accessories] Đồng bộ hóa toàn bộ file dữ liệu tĩnh thành công!')
  } catch (err) {
    console.error('[seed_accessories] Lỗi khi đồng bộ hóa:', err.message)
  }

  process.exit(0)
}

seed().catch((err) => {
  console.error('[seed_accessories error]:', err)
  process.exit(1)
})
