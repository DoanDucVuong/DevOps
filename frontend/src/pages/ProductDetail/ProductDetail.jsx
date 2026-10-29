import { useEffect, useState } from 'react'
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom'
import {
  Heart,
  Minus,
  Plus,
  Truck,
  RefreshCw,
  Sparkles,
  Check,
  Copy,
  ShieldCheck,
  Clock,
  Ticket,
  ChevronRight,
  Share2,
  Ruler,
  ShoppingBag,
  ShoppingCart,
  Zap,
} from 'lucide-react'
import { useProductStore } from '../../store/productStore'
import { colors as colorData, categories } from '../../data/categories'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useToast } from '../../components/common/Toast'
import { formatCurrency } from '../../utils/format'
import Rating from '../../components/common/Rating'
import ProductCard from '../../components/product/ProductCard'
import ProductReviews from '../../components/product/ProductReviews'
import { fetchSimilarProducts, fetchProductById, recordInteraction } from '../../api/client'

const MOCK_VOUCHERS = [
  { code: 'VOUCHER20K', label: 'VOUCHER 20K', desc: 'Đơn từ 299K' },
  { code: 'VOUCHER50K', label: 'VOUCHER 50K', desc: 'Đơn từ 599K' },
  { code: 'VOUCHER80K', label: 'VOUCHER 80K', desc: 'Đơn từ 799K' },
  { code: 'VOUCHER120K', label: 'VOUCHER 120K', desc: 'Đơn từ 1.2M' },
]

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const getProductById = useProductStore((s) => s.getProductById)
  const products = useProductStore((s) => s.products)
  const [detailProduct, setDetailProduct] = useState(null)

  useEffect(() => {
    // Đảm bảo mỗi khi bấm vào xem sản phẩm sẽ nhảy lên đầu trang như ảnh 2
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })

    if (!id) return
    fetchProductById(id)
      .then((data) => {
        if (data) setDetailProduct(data)
      })
      .catch(() => {})
  }, [id])

  const storeProduct = getProductById(id)
  const product = detailProduct ? { ...storeProduct, ...detailProduct } : storeProduct

  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState('den')
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description') // 'description' | 'shipping' | 'return'
  const [copiedVoucher, setCopiedVoucher] = useState('')

  const [related, setRelated] = useState([])
  const [relatedAlgo, setRelatedAlgo] = useState(null)
  const [loadingRelated, setLoadingRelated] = useState(true)

  const addItem = useCartStore((s) => s.addItem)
  const isWished = useWishlistStore((s) => product && s.isWished(product.id))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const { showToast } = useToast()

  // Đồng bộ color/size ban đầu khi product thay đổi
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0])
      }
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0])
      }
      setActiveImage(0)
    }
  }, [product?.id])

  // Ghi nhận hành vi "view" cho hệ thống gợi ý ML
  useEffect(() => {
    if (!product) return
    recordInteraction(product.id, 'view')
  }, [product?.id])

  // Sản phẩm tương tự — TF-IDF + Cosine Similarity từ ML Service
  useEffect(() => {
    if (!product) return
    setLoadingRelated(true)
    fetchSimilarProducts(product.id, 4)
      .then((data) => {
        const items = data?.items || []
        const mapped = items.map((it) => getProductById(it.id) || it).filter(Boolean)
        setRelated(mapped.length > 0 ? mapped : fallbackRelated())
        setRelatedAlgo(data?.algorithm || null)
      })
      .catch(() => {
        setRelated(fallbackRelated())
        setRelatedAlgo(null)
      })
      .finally(() => setLoadingRelated(false))

    function fallbackRelated() {
      return products
        .filter((p) => p.category === product.category && String(p.id) !== String(product.id))
        .slice(0, 4)
    }
  }, [product?.id, product?.category])

  if (!product) return <Navigate to="/404" replace />

  // Chuẩn hóa danh sách hình ảnh sản phẩm (Gallery)
  const rawImages = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? (() => {
        try {
          return JSON.parse(product.images)
        } catch {
          return [product.images]
        }
      })()
    : product.image
    ? [product.image]
    : []

  const defaultImg =
    product.gender === 'Nữ'
      ? 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'

  const mainImg = rawImages[0] || defaultImg

  // Nếu sản phẩm chỉ có 1 ảnh, tạo dải thumbnail đa góc nhìn phong phú
  const galleryImages =
    rawImages.length >= 2
      ? rawImages
      : [
          mainImg,
          mainImg.includes('unsplash.com') ? mainImg.replace('w=800', 'w=801') : mainImg,
          mainImg.includes('unsplash.com') ? mainImg.replace('w=800', 'w=802') : mainImg,
        ]

  // Chuẩn hóa danh sách màu sắc & kích cỡ (kèm fallback mock nếu data thiếu)
  const availableColors =
    product.colors && product.colors.length > 0 ? product.colors : ['den', 'trang', 'be', 'xanh']
  const availableSizes =
    product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL']

  const colorName = (cId) => colorData.find((c) => c.id === cId)?.name || cId
  const colorHex = (cId) => colorData.find((c) => c.id === cId)?.hex || '#17181a'
  const categoryObj = categories.find((c) => c.id === product.category)
  const categoryName = categoryObj ? categoryObj.name : 'Thời trang Maison'

  // Tính giá cũ giả lập nếu chưa có
  const oldPrice = product.oldPrice || (product.price ? Math.round(product.price * 1.25) : 0)
  const discountPercent =
    oldPrice > product.price ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : 0

  const handleAddToCart = () => {
    const colorToUse = selectedColor || availableColors[0] || 'den'
    const sizeToUse = selectedSize || availableSizes[0] || 'M'

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: galleryImages[0] || defaultImg,
      color: colorToUse,
      size: sizeToUse,
      quantity,
    })
    recordInteraction(product.id, 'cart')
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`)
  }

  const handleBuyNow = () => {
    const colorToUse = selectedColor || availableColors[0] || 'den'
    const sizeToUse = selectedSize || availableSizes[0] || 'M'

    recordInteraction(product.id, 'cart')
    // Tách biệt luồng Mua ngay: Không thêm vào giỏ hàng chung, truyền state sang trang Checkout
    navigate('/checkout', {
      state: {
        buyNowItem: {
          ...product,
          productId: product.id,
          id: product.id,
          name: product.name,
          price: product.price,
          image: galleryImages[0] || defaultImg,
          quantity,
          selectedSize: sizeToUse,
          selectedColor: colorToUse,
          size: sizeToUse,
          color: colorToUse,
        },
      },
    })
  }

  const handleCopyVoucher = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedVoucher(code)
    showToast(`Đã sao chép mã ưu đãi: ${code}`)
    setTimeout(() => setCopiedVoucher(''), 2500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* 1. Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-blue-900 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-stone-400 shrink-0" />
        <Link to="/products" className="hover:text-blue-900 transition-colors">
          Sản phẩm
        </Link>
        <ChevronRight size={13} className="text-stone-400 shrink-0" />
        <Link
          to={`/products?category=${product.category || ''}`}
          className="hover:text-blue-900 transition-colors"
        >
          {categoryName}
        </Link>
        <ChevronRight size={13} className="text-stone-400 shrink-0" />
        <span className="text-stone-900 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* 2. Layout chính: 2 cột (Desktop grid-cols-12, Mobile flex-col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        {/* CỘT TRÁI (col-span-7): Dải thumbnail dọc + Ảnh chính to */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Dải thumbnail dọc bên trái */}
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0 py-1 scrollbar-none">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-stone-100 ${
                  activeImage === i
                    ? 'border-blue-900 shadow-sm ring-2 ring-blue-900/20 opacity-100'
                    : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                }`}
                aria-label={`Xem ảnh ${i + 1}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Khung ảnh chính to */}
          <div className="flex-1 aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 relative shadow-xs group">
            <img
              src={galleryImages[activeImage] || mainImg}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = defaultImg
              }}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* Badge Giảm giá */}
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-rose-600 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-md shadow-sm tracking-wider">
                Giảm {discountPercent}%
              </div>
            )}

            {/* Nút Yêu thích (Wishlist) */}
            <button
              type="button"
              onClick={() => {
                toggleWish(product.id)
                showToast(isWished ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào danh sách yêu thích')
              }}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              aria-label="Thêm vào yêu thích"
            >
              <Heart
                size={20}
                className={isWished ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'}
              />
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (col-span-5): Thông tin sản phẩm & Các nút chức năng */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Tiêu đề sản phẩm + Trạng thái Còn hàng theo chuẩn Ảnh 2 */}
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {product.name}
            </h1>
            <span className="inline-block bg-[#16a34a] text-white text-[11px] font-semibold px-2 py-0.5 rounded tracking-wide shrink-0">
              Còn hàng
            </span>
          </div>

          {/* Mã SP & Đánh giá & Đã bán */}
          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] text-stone-500 mb-2">
            <span>
              Mã sản phẩm: <strong className="font-mono text-stone-700 font-semibold uppercase">SKU-MSN-{String(product.id).toUpperCase()}</strong>
            </span>
            {Number(product.review_count || 0) > 0 ? (
              <>
                <span className="text-stone-300">•</span>
                <div className="flex items-center gap-1">
                  <Rating value={Number(product.avg_rating || product.rating || 0)} showValue={false} />
                  <span className="text-stone-700 font-semibold">
                    {Number(product.avg_rating || product.rating || 0).toFixed(1)}/5
                  </span>
                  <span className="text-stone-400">({product.review_count})</span>
                </div>
              </>
            ) : null}
            <span className="text-stone-300">•</span>
            <span className="text-stone-600 font-medium">Đã bán {product.sold_count || 0}</span>
          </div>

          {/* Giá tiền gọn gàng theo chuẩn Ảnh 2 */}
          <div className="flex items-baseline gap-2.5 my-2">
            <span className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {oldPrice > product.price && (
              <span className="text-sm text-stone-400 line-through">
                {formatCurrency(oldPrice)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                Tiết kiệm {discountPercent}%
              </span>
            )}
          </div>

          {/* Khối thông báo ưu đãi vàng nhạt theo mẫu Ảnh 2 */}
          <div className="my-2.5 bg-[#fbf7ed] border border-[#f5ebd7] rounded-xl px-3.5 py-2.5 text-xs text-[#78350f] flex items-center gap-2">
            <span className="text-sm shrink-0">🎾</span>
            <span>Mua 3 sản phẩm trong BST Sportcation tặng 1 túi (không bao gồm phụ kiện)</span>
          </div>

          {/* Mã giảm giá dạng thẻ xanh navy theo Ảnh 2 */}
          <div className="my-2.5">
            <div className="text-xs sm:text-sm font-semibold text-stone-800 mb-2">
              Mã giảm giá
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              {MOCK_VOUCHERS.map((v) => {
                const isCopied = copiedVoucher === v.code
                return (
                  <button
                    key={v.code}
                    type="button"
                    onClick={() => handleCopyVoucher(v.code)}
                    className={`border px-2.5 py-1 rounded text-xs font-semibold tracking-wide transition-all ${
                      isCopied
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                        : 'border-[#1e3a8a] text-[#1e3a8a] bg-white hover:bg-blue-50/80'
                    }`}
                  >
                    {isCopied ? 'ĐÃ LƯU' : v.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div className="my-2.5">
            <div className="text-xs sm:text-sm text-stone-800 mb-2">
              Màu sắc: <span className="font-semibold text-stone-900">{colorName(selectedColor)}</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              {availableColors.map((c) => {
                const isSelected = selectedColor === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{ backgroundColor: colorHex(c) }}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border transition-all flex items-center justify-center shadow-2xs ${
                      isSelected
                        ? 'ring-2 ring-stone-900 ring-offset-2 border-white scale-105'
                        : 'border-stone-300 hover:scale-105 opacity-90 hover:opacity-100'
                    }`}
                    title={colorName(c)}
                    aria-label={`Chọn màu ${colorName(c)}`}
                  >
                    {isSelected && (
                      <Check
                        size={13}
                        className={c === 'trang' || c === 'be' ? 'text-stone-900' : 'text-white'}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chọn Size */}
          <div className="my-2.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-stone-800">
                Kích thước: <span className="font-semibold text-stone-900">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={() => showToast('Bảng size chuẩn: S (45-55kg), M (55-65kg), L (65-75kg), XL (75-85kg)')}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 transition-colors"
              >
                <Ruler size={13} /> Hướng dẫn chọn size
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {availableSizes.map((s) => {
                const isSelected = selectedSize === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-9 sm:w-11 sm:h-10 rounded border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center ${
                      isSelected
                        ? 'border-2 border-stone-900 text-stone-900 bg-stone-50 font-bold shadow-2xs'
                        : 'border-stone-300 text-stone-700 bg-white hover:border-stone-400'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nút CTA (Số lượng, Thêm giỏ, Mua ngay) theo Ảnh 2 */}
          <div className="mt-4 mb-6 space-y-2.5">
            {/* Hàng 1: Số lượng + Nút Vui lòng chọn size và màu / Thêm vào giỏ */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded h-11 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-l transition-colors"
                  aria-label="Giảm số lượng"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-sm text-stone-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-full flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-r transition-colors"
                  aria-label="Tăng số lượng"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-11 rounded border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50/70 font-bold text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <ShoppingCart size={16} />
                {selectedSize && selectedColor ? 'Thêm vào giỏ hàng' : 'VUI LÒNG CHỌN SIZE VÀ MÀU'}
              </button>
            </div>

            {/* Hàng 2: Nút Mua Ngay */}
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full h-11 rounded bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Zap size={16} className="fill-amber-400 text-amber-400" />
              Mua ngay
            </button>
          </div>

          {/* Khối Cam kết dịch vụ */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/60 divide-y divide-stone-200/80 text-xs text-stone-600 space-y-2.5">
            <div className="flex items-center gap-3 pt-2.5 first:pt-0">
              <Truck size={17} className="text-blue-900 shrink-0" />
              <span>
                <strong>Miễn phí vận chuyển</strong> cho đơn hàng từ 500.000đ toàn quốc.
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2.5">
              <RefreshCw size={17} className="text-blue-900 shrink-0" />
              <span>
                <strong>Đổi trả 30 ngày miễn phí</strong> tại nhà nếu sản phẩm không vừa size.
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2.5">
              <ShieldCheck size={17} className="text-blue-900 shrink-0" />
              <span>
                <strong>100% Chính hãng Maison</strong>, cam kết hoàn tiền 200% nếu phát hiện hàng giả.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Phần Tabs Mô tả & Chính sách */}
      <div className="mb-16 bg-white border border-stone-200 rounded-2xl p-6 md:p-8 shadow-2xs">
        {/* Tab Headers */}
        <div className="border-b border-stone-200 flex gap-4 md:gap-8 overflow-x-auto pb-px mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`pb-3 text-sm md:text-base font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${
              activeTab === 'description'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`pb-3 text-sm md:text-base font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Chính sách giao hàng
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('return')}
            className={`pb-3 text-sm md:text-base font-bold tracking-wider uppercase transition-colors relative whitespace-nowrap ${
              activeTab === 'return'
                ? 'text-blue-900 border-b-2 border-blue-900'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Chính sách đổi hàng
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'description' && (
          <div className="text-sm text-stone-700 leading-relaxed space-y-4">
            <p className="font-medium text-stone-900 text-base">
              {product.description ||
                `${product.name} là mẫu thiết kế mới nhất nằm trong bộ sưu tập thời trang cao cấp Maison, hướng tới phong cách tối giản, thanh lịch nhưng vô cùng hiện đại và thời thượng.`}
            </p>

            <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wide pt-2">
              Đặc điểm nổi bật của sản phẩm:
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-stone-600">
              <li>
                <strong>Chất liệu cao cấp:</strong> Vải mềm mại, co giãn tự nhiên, thoáng khí tối đa mang lại cảm giác thoải mái suốt ngày dài.
              </li>
              <li>
                <strong>Phom dáng chuẩn mực:</strong> Thiết kế vừa vặn, tôn dáng người mặc, dễ dàng phối hợp với nhiều trang phục khác nhau.
              </li>
              <li>
                <strong>Đường may tinh tế:</strong> Gia công tỉ mỉ theo tiêu chuẩn may mặc xuất khẩu cao cấp, bền đẹp theo thời gian.
              </li>
              <li>
                <strong>Dễ bảo quản:</strong> Giặt máy thoải mái ở nhiệt độ thường, hạn chế nhăn xù, giữ màu sắc tươi mới sau nhiều lần giặt.
              </li>
            </ul>

            <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wide pt-2">
              Hướng dẫn bảo quản:
            </h4>
            <p className="text-stone-600">
              Nên giặt bằng nước lạnh với xà phòng nhẹ. Tránh phơi trực tiếp dưới ánh nắng gắt. Ủi ở nhiệt độ trung bình dành cho từng loại chất liệu vải.
            </p>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="text-sm text-stone-700 leading-relaxed space-y-4">
            <h4 className="font-bold text-stone-900 text-base">Thời gian và cước phí vận chuyển:</h4>
            <ul className="list-disc pl-5 space-y-2 text-stone-600">
              <li>
                <strong>Khu vực Nội thành (Hà Nội, TP.HCM, Đà Nẵng):</strong> Giao hỏa tốc từ 2-4 tiếng hoặc giao tiêu chuẩn trong vòng 24h.
              </li>
              <li>
                <strong>Các tỉnh thành khác:</strong> Giao hàng qua các đơn vị vận chuyển uy tín (GHTK, Viettel Post) từ 2 đến 3 ngày làm việc.
              </li>
              <li>
                <strong>Cước phí:</strong> Đồng giá 30.000đ cho mọi đơn hàng. <strong>Miễn phí vận chuyển 100%</strong> cho đơn hàng có tổng giá trị từ 500.000đ trở lên.
              </li>
              <li>
                <strong>Chính sách đồng kiểm:</strong> Khách hàng được quyền kiểm tra sản phẩm trước khi thanh toán cho nhân viên giao hàng.
              </li>
            </ul>
          </div>
        )}

        {activeTab === 'return' && (
          <div className="text-sm text-stone-700 leading-relaxed space-y-4">
            <h4 className="font-bold text-stone-900 text-base">Quy định đổi trả hàng tại Maison:</h4>
            <ul className="list-disc pl-5 space-y-2 text-stone-600">
              <li>
                <strong>Thời hạn đổi trả:</strong> Hỗ trợ đổi trả trong vòng <strong>30 ngày</strong> kể từ ngày quý khách nhận được kiện hàng.
              </li>
              <li>
                <strong>Điều kiện hợp lệ:</strong> Sản phẩm còn nguyên tem, mác, hóa đơn mua hàng và chưa qua giặt tẩy hoặc sử dụng.
              </li>
              <li>
                <strong>Đổi size/màu tận nhà:</strong> Maison hỗ trợ cử shipper đến tận nhà quý khách để giao sản phẩm mới và nhận lại sản phẩm cần đổi, quý khách không cần phải mang ra bưu cục.
              </li>
              <li>
                <strong>Hoàn tiền:</strong> Nếu lỗi từ nhà sản xuất hoặc giao sai mẫu, Maison cam kết hoàn tiền 100% qua tài khoản ngân hàng trong 24 giờ.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* 4. Đánh giá & Bình luận khách hàng */}
      <ProductReviews
        productId={product.id}
        initialAvgRating={Number(product.avg_rating || product.rating || 0)}
      />

      {/* 5. Phần Sản phẩm tương tự (AI Recommendation Grid) */}
      {(loadingRelated || related.length > 0) && (
        <section className="mt-16 md:mt-24 pt-10 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={20} className="text-blue-900" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  Sản phẩm tương tự
                </h2>
              </div>
              <p className="text-xs text-stone-500">
                Gợi ý thông minh dựa trên độ tương đồng nội dung (Content-based AI Recommendation)
              </p>
            </div>
            <Link
              to={`/products?category=${product.category || ''}`}
              className="text-xs font-bold uppercase tracking-wider text-blue-900 hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              Xem thêm {categoryName} <ChevronRight size={14} />
            </Link>
          </div>

          {loadingRelated ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-stone-200 rounded-xl" />
                  <div className="h-4 bg-stone-200 rounded w-4/5" />
                  <div className="h-3.5 bg-stone-200 rounded w-2/5" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
