import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { products } from '../../data/products'
import { categories } from '../../data/categories'
import ProductCard from '../../components/product/ProductCard'

const CATEGORY_IMAGES = {
  'ao-khoac': 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=600&q=70',
  'ao-so-mi': 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=70',
  'ao-thun': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=70',
  quan: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=70',
  vay: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=70',
  'phu-kien': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=70',
}

export default function Home() {
  const featured = products.filter((p) => p.isFeatured).slice(0, 8)
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4)

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          <p className="text-sm text-clay font-medium mb-3">Bộ sưu tập Thu Đông 2026</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-6">
            Mặc đẹp mỗi ngày, không cần cố gắng
          </h1>
          <p className="text-ink-soft max-w-md mb-8 leading-relaxed">
            Maison chọn lọc những thiết kế tối giản, chất liệu bền và dễ phối,
            để bạn dành thời gian cho những điều quan trọng hơn tủ đồ.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
          >
            Khám phá ngay <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="order-1 md:order-2 aspect-[4/5] md:aspect-[3/4] rounded-sm overflow-hidden bg-stone">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80"
            alt="Bộ sưu tập thời trang mới"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

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
                src={CATEGORY_IMAGES[c.id]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
              />
              <span className="relative z-10 bg-paper/90 px-3 py-1.5 rounded-sm text-sm font-medium">
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
