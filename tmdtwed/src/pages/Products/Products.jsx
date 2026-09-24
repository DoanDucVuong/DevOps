import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { products } from '../../data/products'
import ProductCard from '../../components/product/ProductCard'
import ProductFilters, { PRICE_RANGES } from '../../components/product/ProductFilters'
import EmptyState from '../../components/common/EmptyState'
import { ProductGridSkeleton } from '../../components/common/Skeleton'
import { useEffect } from 'react'

const SORT_OPTIONS = [
  { id: 'default', label: 'Mặc định' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
  { id: 'rating', label: 'Đánh giá cao nhất' },
  { id: 'newest', label: 'Mới nhất' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    priceRange: 'all',
    colors: [],
    sizes: [],
  })
  const [sort, setSort] = useState('default')
  const query = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [filters, sort, query])

  const handleFilterChange = (next) => {
    setFilters(next)
    if (next.category !== 'all') {
      setSearchParams((prev) => {
        prev.set('category', next.category)
        return prev
      })
    }
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    }
    if (filters.category !== 'all') {
      list = list.filter((p) => p.category === filters.category)
    }
    if (filters.priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === filters.priceRange)
      list = list.filter((p) => p.price >= range.min && p.price < range.max)
    }
    if (filters.colors.length > 0) {
      list = list.filter((p) => p.colors.some((c) => filters.colors.includes(c)))
    }
    if (filters.sizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)))
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        break
    }
    return list
  }, [filters, sort, query])

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1">
          {query ? `Kết quả cho "${query}"` : 'Tất cả sản phẩm'}
        </h1>
        <p className="text-sm text-ink-soft">{filtered.length} sản phẩm</p>
      </div>

      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="hidden md:block">
          <ProductFilters filters={filters} onChange={handleFilterChange} />
        </aside>

        <div>
          <div className="flex items-center justify-between mb-6 gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 text-sm border border-stone-dark rounded-sm px-3 py-2"
            >
              <SlidersHorizontal size={15} /> Bộ lọc
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-auto text-sm border border-stone-dark rounded-sm px-3 py-2 bg-paper"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Không tìm thấy sản phẩm"
              description="Thử điều chỉnh bộ lọc hoặc từ khoá tìm kiếm khác."
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-paper p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl">Bộ lọc</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Đóng">
                <X size={20} />
              </button>
            </div>
            <ProductFilters filters={filters} onChange={handleFilterChange} />
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-8 py-3 bg-ink text-ivory text-sm rounded-sm"
            >
              Xem {filtered.length} kết quả
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
