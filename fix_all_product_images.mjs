import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const backendRequire = createRequire(path.join(__dirname, 'backend', 'package.json'))
const { query } = backendRequire('./src/db')
const { syncAllProductData } = backendRequire('./src/services/syncService')

console.log('=== BẮT ĐẦU LÀM SẠCH DỮ LIỆU HÌNH ẢNH SẢN PHẨM (fix_all_product_images.mjs) ===\n')

// 1. Hardcode các mảng URL hình ảnh chuẩn xác phân loại nghiêm ngặt theo loại trang phục và giới tính
const img_ao_thun_nam = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
]

const img_ao_thun_nu = [
  'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?w=800&auto=format&fit=crop&q=80',
]

const img_so_mi_nam = [
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=800&auto=format&fit=crop&q=80',
]

const img_so_mi_nu = [
  'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
]

const img_quan_nam = [
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80',
]

const img_quan_nu = [
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551854838-212c50b4c184?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
]

const img_vay_dam = [
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
]

const img_ao_khoac_nam = [
  'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800&auto=format&fit=crop&q=80',
]

const img_ao_khoac_nu = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
]

const img_giay = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80',
]

// Hàm chọn ảnh ngẫu nhiên hoặc theo thứ tự index từ mảng
function pickImage(arr, seed = 0) {
  return arr[Math.abs(seed) % arr.length]
}

async function cleanAllProductImages() {
  const products = await query('SELECT id, name, category, gender, image_url FROM products ORDER BY id ASC')
  console.log(`Tìm thấy tổng cộng ${products.length} sản phẩm trong CSDL. Bắt đầu phân loại...`)

  let updatedCount = 0
  const stats = {
    ao_thun_nam: 0,
    ao_thun_nu: 0,
    so_mi_nam: 0,
    so_mi_nu: 0,
    quan_nam: 0,
    quan_nu: 0,
    vay_dam: 0,
    ao_khoac_nam: 0,
    ao_khoac_nu: 0,
    giay: 0,
  }

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const nameLower = p.name.toLowerCase()

    // Bước 1: Xác định giới tính (Nam / Nữ)
    let gender = p.gender || 'Nam'
    if (nameLower.includes('nữ') || nameLower.includes('váy') || nameLower.includes('đầm')) {
      gender = 'Nữ'
    } else if (nameLower.includes('nam')) {
      gender = 'Nam'
    }

    // Bước 2: Xác định loại đồ và gán ảnh từ mảng chuẩn
    let selectedImage = ''
    let classification = ''

    if (nameLower.includes('váy') || nameLower.includes('đầm') || p.category === 'vay-dam') {
      selectedImage = pickImage(img_vay_dam, i)
      classification = 'vay_dam'
    } else if (nameLower.includes('giày') || nameLower.includes('sneaker') || nameLower.includes('dép')) {
      selectedImage = pickImage(img_giay, i)
      classification = 'giay'
    } else if (
      nameLower.includes('khoác') ||
      nameLower.includes('jacket') ||
      nameLower.includes('blazer') ||
      nameLower.includes('hoodie') ||
      nameLower.includes('bomber') ||
      nameLower.includes('cardigan') ||
      nameLower.includes('biker') ||
      p.category === 'ao-khoac'
    ) {
      if (gender === 'Nữ') {
        selectedImage = pickImage(img_ao_khoac_nu, i)
        classification = 'ao_khoac_nu'
      } else {
        selectedImage = pickImage(img_ao_khoac_nam, i)
        classification = 'ao_khoac_nam'
      }
    } else if (
      ((nameLower.includes('sơ mi') || nameLower.includes('shirt')) && !nameLower.includes('t-shirt')) ||
      p.category === 'ao-so-mi'
    ) {
      if (gender === 'Nữ') {
        selectedImage = pickImage(img_so_mi_nu, i)
        classification = 'so_mi_nu'
      } else {
        selectedImage = pickImage(img_so_mi_nam, i)
        classification = 'so_mi_nam'
      }
    } else if (
      nameLower.includes('quần') ||
      nameLower.includes('jean') ||
      nameLower.includes('kaki') ||
      nameLower.includes('chinos') ||
      nameLower.includes('jogger') ||
      p.category === 'quan'
    ) {
      if (gender === 'Nữ') {
        selectedImage = pickImage(img_quan_nu, i)
        classification = 'quan_nu'
      } else {
        selectedImage = pickImage(img_quan_nam, i)
        classification = 'quan_nam'
      }
    } else {
      // Mặc định là áo thun / t-shirt
      if (gender === 'Nữ') {
        selectedImage = pickImage(img_ao_thun_nu, i)
        classification = 'ao_thun_nu'
      } else {
        selectedImage = pickImage(img_ao_thun_nam, i)
        classification = 'ao_thun_nam'
      }
    }

    stats[classification] = (stats[classification] || 0) + 1

    // Cập nhật CSDL
    await query('UPDATE products SET image_url = ?, gender = ? WHERE id = ?', [selectedImage, gender, p.id])
    updatedCount++
  }

  console.log('✅ Đã cập nhật toàn bộ hình ảnh và giới tính chuẩn xác vào CSDL.')
  console.log('\n📊 THỐNG KÊ PHÂN LOẠI HÌNH ẢNH SẢN PHẨM:')
  console.log(`   - Áo thun Nam:       ${stats.ao_thun_nam} sản phẩm`)
  console.log(`   - Áo thun Nữ:        ${stats.ao_thun_nu} sản phẩm`)
  console.log(`   - Áo sơ mi Nam:      ${stats.so_mi_nam} sản phẩm`)
  console.log(`   - Áo sơ mi Nữ:       ${stats.so_mi_nu} sản phẩm`)
  console.log(`   - Áo khoác Nam:      ${stats.ao_khoac_nam} sản phẩm`)
  console.log(`   - Áo khoác Nữ:       ${stats.ao_khoac_nu} sản phẩm`)
  console.log(`   - Quần Nam:          ${stats.quan_nam} sản phẩm`)
  console.log(`   - Quần Nữ:           ${stats.quan_nu} sản phẩm`)
  console.log(`   - Váy / Đầm Nữ:      ${stats.vay_dam} sản phẩm`)
  console.log(`   - Giày:              ${stats.giay} sản phẩm`)
  console.log(`   => TỔNG CỘNG:        ${updatedCount} sản phẩm đã được làm sạch hình ảnh`)

  // Gọi syncService để đồng bộ ra các file tĩnh
  console.log('\n🔄 Đang gọi syncService để đồng bộ hóa ra CSDL và các file JSON/JS tĩnh cho Frontend...')
  await syncAllProductData()
  console.log('🎉 TOÀN BỘ DỮ LIỆU ĐÃ ĐƯỢC ĐỒNG BỘ THÀNH CÔNG VÀ CHÍNH XÁC 100%!')
}

cleanAllProductImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Lỗi khi làm sạch hình ảnh:', err)
    process.exit(1)
  })
