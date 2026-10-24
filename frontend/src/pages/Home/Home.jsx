import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { products, getProductById } from '../../data/products'
import { useCategoryStore } from '../../store/categoryStore'
import ProductCard from '../../components/product/ProductCard'
import { fetchRecommendations, trackRecommendationClick, fetchBanners } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { getEffectiveUserId } from '../../utils/guestId'

const DEFAULT_CATEGORY_IMAGES = {
  'ao-khoac': 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=70',
  'ao-so-mi': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=70',
  'ao-thun': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=70',
  quan: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=70',
  vay: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=70',
  'phu-kien': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=70',
}

const DEFAULT_BANNER = {
  subtitle: 'Bộ sưu tập Thu Đông 2026',
  title: 'Mặc đẹp mỗi ngày, không cần cố gắng',
  description: 'Maison chọn lọc những thiết kế tối giản, chất liệu bền và dễ phối, để bạn dành thời gian cho những điều quan trọng hơn tủ đồ.',
  image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80',
  cta_text: 'Khám phá ngay',
  cta_link: '/products',
}

const ALGO_LABELS = {
  hybrid: 'Hybrid (Content-based + Collaborative Filtering)',
  popularity: 'Sản phẩm phổ biến (Popularity-based — chưa đủ dữ liệu cá nhân hoá)',
  fallback_top_rated: 'Đánh giá cao nhất (ML service tạm không phản hồi)',
}

export default function Home() {
  const featured = products.filter((p) => p.isFeatured).slice(0, 8)
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4)
  const user = useAuthStore((s) => s.user)
  const categories = useCategoryStore((s) => s.categories)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)

  const [recommended, setRecommended] = useState([])
  const [algorithm, setAlgorithm] = useState(null)
  const [loadingRec, setLoadingRec] = useState(true)
  const [banner, setBanner] = useState(DEFAULT_BANNER)

  useEffect(() => {
    fetchCategories()
    fetchBanners()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanner(data[0])
        }
      })
      .catch(() => {})
  }, [fetchCategories])

  useEffect(() => {
    const userId = getEffectiveUserId(user)
    setLoadingRec(true)
    fetchRecommendations(userId, 8)
      .then((data) => {
        const mapped = data.items.map((it) => getProductById(it.id)).filter(Boolean)
        setRecommended(mapped)
        setAlgorithm(data.algorithm)
      })
      .catch(() => {
        // Backend/ML service chưa chạy -> ẩn khu vực gợi ý thay vì làm vỡ trang chủ
        setRecommended([])
      })
      .finally(() => setLoadingRec(false))
  }, [user])

  const handleRecommendedClick = (productId) => {
    trackRecommendationClick(getEffectiveUserId(user), productId)
  }

  return (
    <div>
      {/* Hero Banner (Động từ API hoặc mặc định) */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          {banner.subtitle && (
            <p className="text-sm text-clay font-medium mb-3">{banner.subtitle}</p>
          )}
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-6">
            {banner.title}
          </h1>
          <p className="text-ink-soft max-w-md mb-8 leading-relaxed">
            {banner.description || 'Maison chọn lọc những thiết kế tối giản, chất liệu bền và dễ phối, để bạn dành thời gian cho những điều quan trọng hơn tủ đồ.'}
          </p>
          <Link
            to={banner.cta_link || '/products'}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
          >
            {banner.cta_text || 'Khám phá ngay'} <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="order-1 md:order-2 aspect-[4/5] md:aspect-[3/4] rounded-sm overflow-hidden bg-stone shadow-sm">
          <img
            src={banner.image_url || DEFAULT_BANNER.image_url}
            alt={banner.title}
            className="w-full h-full object-cover transition-opacity duration-300"
            onError={(e) => { e.currentTarget.src = DEFAULT_BANNER.image_url }}
          />
        </div>
      </section>

      {/* Recommended for You — Machine Learning (Hybrid Recommendation) */}
      {(loadingRec || recommended.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-clay" />
            <h2 className="font-display text-2xl">Gợi ý dành cho bạn</h2>
          </div>
          {algorithm && (
            <p className="text-xs text-ink-soft mb-6">
              Thuật toán: {ALGO_LABELS[algorithm] || algorithm}
            </p>
          )}
          {loadingRec ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-stone rounded-sm mb-3" />
                  <div className="h-3 bg-stone rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
              {recommended.map((p) => (
                <div key={p.id} onClick={() => handleRecommendedClick(p.id)}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <h2 className="font-display text-2xl mb-6">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="group relative aspect-[4/3] rounded-sm overflow-hidden bg-stone flex items-end p-4"
            >
              <img
                src={c.image_url || DEFAULT_CATEGORY_IMAGES[c.id] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=70'}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <span className="relative z-10 bg-paper/90 px-3 py-1.5 rounded-sm text-sm font-medium shadow-sm">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Được yêu thích nhất</h2>
          <Link to="/products" className="text-sm text-clay hover:underline">Xem tất cả</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New arrivals banner */}
      <section className="bg-ink text-ivory py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl">Hàng mới về</h2>
            <Link to="/products" className="text-sm text-gold hover:underline">Xem tất cả</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {newArrivals.map((p) => (
              <Link key={p.id} to={`/products/${p.id}`} className="group">
                <div className="aspect-[3/4] rounded-sm overflow-hidden bg-ink-soft mb-3">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-sm">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
