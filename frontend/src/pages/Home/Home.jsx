import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Sparkles,
  Truck,
  RefreshCw,
  ShieldCheck,
  Zap,
  Star,
  ChevronRight,
  CheckCircle2,
  Flame,
  Award,
  TrendingUp,
  Mail,
  ArrowUpRight,
  ShoppingBag,
} from 'lucide-react'
import { useProductStore } from '../../store/productStore'
import { useCategoryStore } from '../../store/categoryStore'
import ProductCard from '../../components/product/ProductCard'
import { fetchRecommendations, trackRecommendationClick, fetchBanners } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { getEffectiveUserId } from '../../utils/guestId'
import { useToast } from '../../components/common/Toast'

const DEFAULT_CATEGORY_IMAGES = {
  'ao-khoac': 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=700&q=80',
  'ao-so-mi': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80',
  'ao-thun': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80',
  quan: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=700&q=80',
  vay: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80',
  'phu-kien': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=80',
}

const DEFAULT_BANNER = {
  subtitle: 'BỘ SƯU TẬP THỜI TRANG 2026',
  title: 'Mặc đẹp mỗi ngày, không cần cố gắng',
  description:
    'Maison chọn lọc những thiết kế tối giản đương đại, dệt từ chất liệu tự nhiên bền bỉ và phom dáng chuẩn mực, giúp bạn luôn tự tin và thanh lịch trong mọi khoảnh khắc.',
  image_url:
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80',
  cta_text: 'Khám phá bộ sưu tập',
  cta_link: '/products',
}

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Thái Thanh Chiêu',
    role: 'Khách hàng thân thiết',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    comment:
      'Chất vải áo khoác của Maison thật sự vượt kỳ vọng, đường kim mũi chỉ vô cùng sắc nét và tôn dáng. Đã mua lần thứ 4 rồi!',
    rating: 5,
    product: 'Áo Khoác Giả Lông Cừu',
  },
  {
    id: 2,
    name: 'Hoàng Minh Quân',
    role: 'Verified Buyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    comment:
      'Giao hàng hỏa tốc trong 24h, áo sơ mi chống nhăn mặc đi làm cả ngày vẫn đứng form chuẩn chỉnh. Dịch vụ chăm sóc khách hàng 10/10.',
    rating: 5,
    product: 'Áo Sơ Mi Poplin Cotton',
  },
  {
    id: 3,
    name: 'Nguyễn Bích Ngọc',
    role: 'Fashion Blogger',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    comment:
      'Phong cách tối giản nhưng toát lên vẻ sang trọng. Rất thích tone màu nhã nhặn của các set đồ, phối với bất kỳ phụ kiện nào cũng đẹp.',
    rating: 5,
    product: 'Váy Midi Linen Dáng Xòe',
  },
]

export default function Home() {
  const { showToast } = useToast()
  const products = useProductStore((s) => s.products)
  const getProductById = useProductStore((s) => s.getProductById)
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const categories = useCategoryStore((s) => s.categories)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)
  const user = useAuthStore((s) => s.user)

  const [activeTab, setActiveTab] = useState('bestseller') // 'bestseller' | 'new' | 'featured'
  const [recommended, setRecommended] = useState([])
  const [algorithm, setAlgorithm] = useState(null)
  const [loadingRec, setLoadingRec] = useState(true)
  const [banner, setBanner] = useState(DEFAULT_BANNER)
  const [emailInput, setEmailInput] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBanners()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const b = data[0]
          setBanner({
            ...DEFAULT_BANNER,
            ...b,
            description: b.description || DEFAULT_BANNER.description,
          })
        }
      })
      .catch(() => {})
  }, [fetchProducts, fetchCategories])

  // Gợi ý AI Machine Learning
  useEffect(() => {
    const userId = getEffectiveUserId(user)
    setLoadingRec(true)
    fetchRecommendations(userId, 8)
      .then((data) => {
        const items = data?.items || []
        const mapped = items.map((it) => getProductById(it.id) || it).filter(Boolean)
        setRecommended(mapped)
        setAlgorithm(data?.algorithm || null)
      })
      .catch((err) => {
        console.warn('[Home] Không tải được gợi ý AI:', err.message)
        setRecommended([])
      })
      .finally(() => setLoadingRec(false))
  }, [user, getProductById])

  const handleRecommendedClick = (productId) => {
    trackRecommendationClick(getEffectiveUserId(user), productId)
  }

  // Danh sách sản phẩm theo từng tab
  const bestSellers = [...products]
    .sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0))
    .slice(0, 8)

  const newArrivals = products.filter((p) => p.isNew).slice(0, 8)

  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 8)

  const tabProducts =
    activeTab === 'bestseller'
      ? bestSellers
      : activeTab === 'new'
      ? newArrivals
      : featuredProducts

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!emailInput.trim()) return
    setSubscribed(true)
    showToast('Đăng ký thành công! Mã giảm giá 10% đã được gửi tới email của bạn.')
    setEmailInput('')
  }

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* 1. HERO SHOWCASE CHUẨN LUXURY MODERN */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-stone-100 via-stone-50 to-blue-50/40 border border-stone-200/80 p-6 sm:p-10 lg:p-16 overflow-hidden shadow-xs">
          {/* Họa tiết trang trí nền tinh tế */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Cột trái: Tiêu đề & Thông điệp thương hiệu */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs font-bold text-blue-950 shadow-2xs">
                <Sparkles size={14} className="text-amber-500 fill-amber-400" />
                <span className="tracking-wider uppercase">
                  {banner.subtitle || 'BỘ SƯU TẬP THU ĐÔNG 2026'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.1]">
                {banner.title || 'Mặc đẹp mỗi ngày, không cần cố gắng'}
              </h1>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-xl">
                {banner.description || DEFAULT_BANNER.description}
              </p>

              {/* Nút hành động */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={banner.cta_link || '/products'}
                  className="px-7 py-3.5 rounded-xl bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-[0.99]"
                >
                  {banner.cta_text || 'Khám phá ngay'}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/products?gender=Nam"
                  className="px-5 py-3.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm uppercase tracking-wide transition-all shadow-2xs"
                >
                  Đồ Nam
                </Link>
                <Link
                  to="/products?gender=Nữ"
                  className="px-5 py-3.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs sm:text-sm uppercase tracking-wide transition-all shadow-2xs"
                >
                  Đồ Nữ
                </Link>
              </div>

              {/* Số liệu uy tín (Social Proof) */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 max-w-md">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900">100K+</div>
                  <div className="text-[11px] text-stone-500 font-medium">Khách hàng tin tưởng</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-1">
                    4.9 <Star size={16} className="fill-amber-400 text-amber-400 inline" />
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium">Đánh giá 5 sao</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-stone-900">100%</div>
                  <div className="text-[11px] text-stone-500 font-medium">Chính hãng Maison</div>
                </div>
              </div>
            </div>

            {/* Cột phải: Hình ảnh Fashion Lookbook có thẻ nổi (Floating Cards) */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-200 shadow-xl border-4 border-white group">
                <img
                  src={banner.image_url || DEFAULT_BANNER.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_BANNER.image_url
                  }}
                />

                {/* Thẻ nổi 1: Cam kết chất liệu */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-stone-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0">
                    <Award size={15} />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold leading-none">
                      Tiêu chuẩn
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      Sợi Cotton Tự Nhiên
                    </span>
                  </div>
                </div>

                {/* Thẻ nổi 2: Đánh giá thực tế */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-stone-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-semibold leading-none">
                      Cộng đồng
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      Hơn 12.000+ Phản hồi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THANH CAM KẾT DỊCH VỤ 4 TRỤ CỘT (Value Propositions) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Miễn phí vận chuyển</h4>
              <p className="text-[11px] text-stone-500">Đơn hàng từ 500.000đ toàn quốc</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Đổi trả 30 ngày</h4>
              <p className="text-[11px] text-stone-500">Đổi size tận nơi, miễn phí tại nhà</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">100% Chính hãng</h4>
              <p className="text-[11px] text-stone-500">Cam kết hoàn tiền 200% nếu giả</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Zap size={22} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900">Giao hàng hỏa tốc</h4>
              <p className="text-[11px] text-stone-500">Nhận hàng trong 24-48 giờ</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DANH MỤC THỊNH HÀNH (Visual Categories Grid) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a]">
                Danh mục nổi bật
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Khám Phá Theo Nhu Cầu
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline flex items-center gap-1 transition-colors"
          >
            Tất cả danh mục <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-end p-4"
            >
              <img
                src={
                  c.image_url ||
                  DEFAULT_CATEGORY_IMAGES[c.id] ||
                  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80'
                }
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
              />
              {/* Lớp phủ chuyển sắc tối tạo độ sâu */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent transition-opacity group-hover:opacity-90" />

              <div className="relative z-10 text-white">
                <span className="text-sm font-bold block leading-tight group-hover:text-amber-300 transition-colors">
                  {c.name}
                </span>
                <span className="text-[11px] text-stone-300 inline-flex items-center gap-1 font-medium mt-1">
                  Khám phá <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. GỢI Ý THÔNG MINH BỞI AI (AI Personalized Recommendation) */}
      {(loadingRec || recommended.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#1e3a8a] border border-blue-200/70 mb-2 shadow-2xs">
                <Sparkles size={13} className="text-amber-500 fill-amber-400" />
                AI Recommendation Engine
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Gợi Ý Dành Riêng Cho Bạn
              </h2>
              {algorithm && (
                <p className="text-xs text-stone-500 mt-1">
                  Thuật toán: <strong>{algorithm}</strong> (Phân tích sở thích thời trang thực tế)
                </p>
              )}
            </div>

            <Link
              to="/products"
              className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] hover:underline flex items-center gap-1"
            >
              Xem thêm gợi ý <ChevronRight size={14} />
            </Link>
          </div>

          {loadingRec ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-3">
                  <div className="aspect-[3/4] bg-stone-200 rounded-2xl" />
                  <div className="h-4 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-3.5 bg-stone-200 rounded-md w-1/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommended.slice(0, 8).map((p) => (
                <div key={p.id} onClick={() => handleRecommendedClick(p.id)}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 5. KHÁM PHÁ THEO TAB (Bán chạy nhất | Hàng mới về | Được yêu thích) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Bộ Sưu Tập Nổi Bật
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Tuyển tập những thiết kế được săn đón nhiều nhất trong tuần
            </p>
          </div>

          {/* Dải nút chuyển Tab tương tác */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('bestseller')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bestseller'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Flame size={14} className="text-rose-500 fill-rose-500" />
              Bán chạy
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles size={14} className="text-amber-500" />
              Mới về
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'featured'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp size={14} className="text-blue-900" />
              Nổi bật
            </button>
          </div>
        </div>

        {/* Lưới sản phẩm theo Tab */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {tabProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="text-center pt-10">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50/70 font-bold text-xs uppercase tracking-wider transition-all"
          >
            Xem toàn bộ sản phẩm ({products.length})
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* 6. BANNER LOOKBOOK & TUYÊN NGÔN THỜI TRANG */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="relative rounded-3xl bg-stone-900 text-white overflow-hidden shadow-xl">
          <div className="grid md:grid-cols-12 items-center">
            {/* Ảnh Lookbook */}
            <div className="md:col-span-6 aspect-[4/3] md:aspect-[5/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
                alt="Maison Lookbook 2026"
                className="w-full h-full object-cover opacity-90"
              />
            </div>

            {/* Nội dung Lookbook */}
            <div className="md:col-span-6 p-8 sm:p-12 lg:p-16 space-y-5">
              <span className="text-xs font-bold tracking-widest uppercase text-amber-400 block">
                MAISON MANIFESTO
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                Tinh giản không phải là ít hơn, mà là hoàn hảo hơn.
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                Chúng tôi tin rằng trang phục bạn mặc mỗi ngày phản chiếu phong thái và cá tính của bạn. Mỗi đường may, mỗi mét vải đều được chọn lọc khắt khe để mang lại trải nghiệm êm ái, bền bỉ và trường tồn cùng thời gian.
              </p>
              <div className="pt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-stone-900 hover:bg-stone-100 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Khám phá phong cách Maison <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ĐÁNH GIÁ CHÂN THỰC TỪ KHÁCH HÀNG (Testimonials Showcase) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
            <Star size={13} className="fill-amber-400 text-amber-400" />
            Khách hàng nói về Maison
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Trải Nghiệm Thực Tế
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Hơn 100.000 khách hàng trên toàn quốc đã lựa chọn và đồng hành cùng Maison
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-2xs space-y-4 hover:shadow-md hover:border-stone-300 transition-all"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-stone-700 text-xs sm:text-sm leading-relaxed italic">
                "{t.comment}"
              </p>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover border border-stone-200 shadow-2xs"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">{t.name}</h4>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <CheckCircle2 size={11} className="text-emerald-600" /> {t.role}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-md">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. ĐĂNG KÝ THÀNH VIÊN VIP (Newsletter / Maison VIP Club) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-blue-950 via-[#1e3a8a] to-blue-900 text-white p-8 sm:p-12 lg:p-16 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-xl mx-auto space-y-4 relative z-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 tracking-wider uppercase border border-white/20">
              Maison Privilege Club
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Nhận Voucher 10% Cho Đơn Hàng Đầu Tiên
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
              Trở thành thành viên Maison Club để nhận đặc quyền mua sắm sớm các bộ sưu tập giới hạn và vô vàn mã giảm giá độc quyền.
            </p>

            <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Nhập email của bạn..."
                  className="w-full bg-white text-stone-900 pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm outline-none shadow-sm placeholder:text-stone-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 active:scale-[0.99]"
              >
                Đăng ký ngay
              </button>
            </form>

            <p className="text-[11px] text-blue-200/80 pt-1">
              Cam kết không gửi thư rác. Bạn có thể hủy đăng ký bất cứ lúc nào.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
