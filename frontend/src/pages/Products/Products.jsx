import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  SlidersHorizontal,
  X,
  ChevronRight,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useProductStore } from '../../store/productStore'
import { useCategoryStore } from '../../store/categoryStore'
import ProductCard from '../../components/product/ProductCard'
import ProductFilters, { PRICE_RANGES } from '../../components/product/ProductFilters'
import EmptyState from '../../components/common/EmptyState'
import { ProductGridSkeleton } from '../../components/common/Skeleton'

const SORT_OPTIONS = [
  { id: 'default', label: 'Mặc định (Nổi bật)' },
  { id: 'price-asc', label: 'Giá: Thấp đến Cao' },
  { id: 'price-desc', label: 'Giá: Cao đến Thấp' },
  { id: 'rating', label: 'Đánh giá cao nhất' },
  { id: 'newest', label: 'Sản phẩm mới nhất' },
]

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const products = useProductStore((s) => s.products)
  const fetchProducts = useProductStore((s) => s.fetchProducts)
  const categories = useCategoryStore((s) => s.categories)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const [filters, setFilters] = useState({
    gender: searchParams.get('gender') || 'all',
    category: searchParams.get('category') || 'all',
    priceRange: 'all',
    colors: [],
    sizes: [],
  })
  const [sort, setSort] = useState('default')
  const query = searchParams.get('q') || ''

  // Đồng bộ category & gender từ URL khi searchParams thay đổi (ví dụ bấm link trên Header)
  useEffect(() => {
    const cat = searchParams.get('category') || 'all'
    const gen = searchParams.get('gender') || 'all'
    setFilters((prev) =>
      prev.category !== cat || prev.gender !== gen
        ? { ...prev, category: cat, gender: gen }
        : prev
    )
  }, [searchParams])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(t)
  }, [filters, sort, query])

  // Khi bất kỳ bộ lọc (khoảng giá, danh mục, kích cỡ, màu...) hoặc sắp xếp thay đổi,
  // luôn lập tức cuộn lên đầu trang để người dùng nhìn thấy các sản phẩm đầu tiên như Ảnh số 2
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [filters.gender, filters.category, filters.priceRange, filters.colors, filters.sizes, sort])

  const handleFilterChange = (next) => {
    setFilters(next)
    setSearchParams((prev) => {
      if (next.category && next.category !== 'all') prev.set('category', next.category)
      else prev.delete('category')
      if (next.gender && next.gender !== 'all') prev.set('gender', next.gender)
      else prev.delete('gender')
      return prev
    })
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }

  const removeFilter = (key, value) => {
    if (key === 'gender') handleFilterChange({ ...filters, gender: 'all' })
    if (key === 'category') handleFilterChange({ ...filters, category: 'all' })
    if (key === 'priceRange') handleFilterChange({ ...filters, priceRange: 'all' })
    if (key === 'colors')
      handleFilterChange({ ...filters, colors: filters.colors.filter((c) => c !== value) })
    if (key === 'sizes')
      handleFilterChange({ ...filters, sizes: filters.sizes.filter((s) => s !== value) })
  }

  const clearAllFilters = () => {
    handleFilterChange({
      gender: 'all',
      category: 'all',
      priceRange: 'all',
      colors: [],
      sizes: [],
    })
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (query) {
      list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    }
    if (filters.gender && filters.gender !== 'all') {
      list = list.filter((p) => p.gender === filters.gender)
    }
    if (filters.category !== 'all') {
      list = list.filter((p) => p.category === filters.category)
    }
    if (filters.priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === filters.priceRange)
      if (range) {
        list = list.filter((p) => p.price >= range.min && p.price < range.max)
      }
    }
    if (filters.colors.length > 0) {
      list = list.filter((p) => p.colors && p.colors.some((c) => filters.colors.includes(c)))
    }
    if (filters.sizes.length > 0) {
      list = list.filter((p) => p.sizes && p.sizes.some((s) => filters.sizes.includes(s)))
    }

    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => (b.avg_rating || b.rating || 0) - (a.avg_rating || a.rating || 0))
        break
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        break
    }
    return list
  }, [products, filters, sort, query])

  const categoryObj = categories.find((c) => c.id === filters.category)
  const categoryLabel = categoryObj ? categoryObj.name : null

  const hasActiveFilters =
    (filters.gender && filters.gender !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    (filters.priceRange && filters.priceRange !== 'all') ||
    filters.colors.length > 0 ||
    filters.sizes.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 mb-4 flex-wrap">
        <Link to="/" className="hover:text-blue-900 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-stone-400 shrink-0" />
        <Link to="/products" className="hover:text-blue-900 transition-colors">
          Sản phẩm
        </Link>
        {filters.gender && filters.gender !== 'all' && (
          <>
            <ChevronRight size={13} className="text-stone-400 shrink-0" />
            <span className="text-stone-700 font-medium">Đồ {filters.gender}</span>
          </>
        )}
        {categoryLabel && (
          <>
            <ChevronRight size={13} className="text-stone-400 shrink-0" />
            <span className="text-stone-900 font-bold">{categoryLabel}</span>
          </>
        )}
      </nav>

      {/* 2. Tiêu đề Trang (Page Hero Title) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-900" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Maison Collection
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 tracking-tight mb-2">
          {query
            ? `Kết quả tìm kiếm cho "${query}"`
            : categoryLabel
            ? categoryLabel
            : filters.gender === 'Nam'
            ? 'Thời Trang Nam'
            : filters.gender === 'Nữ'
            ? 'Thời Trang Nữ'
            : 'Tất Cả Sản Phẩm'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">
          Bộ sưu tập thời trang cao cấp với chất liệu tự nhiên, phom dáng chuẩn mực và phong cách hiện đại.
        </p>
      </div>

      {/* 3. Layout chính: Cột trái (Bộ lọc) + Cột phải (Danh sách sản phẩm) */}
      <div className="grid md:grid-cols-[250px_1fr] lg:grid-cols-[270px_1fr] gap-8 items-start">
        {/* CỘT TRÁI (Sticky Sidebar Bộ lọc) */}
        <aside className="hidden md:block sticky top-20">
          <ProductFilters filters={filters} onChange={handleFilterChange} />
        </aside>

        {/* CỘT PHẢI (Toolbar + Danh sách sản phẩm) */}
        <div>
          {/* Thanh công cụ (Toolbar: Số lượng, Bộ lọc Mobile, Sắp xếp) */}
          <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-200/80 flex-wrap">
            {/* Nút mở bộ lọc trên mobile */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 text-xs font-bold border border-stone-300 rounded-xl px-3 py-2 bg-white text-stone-800 shadow-2xs hover:bg-stone-50"
            >
              <SlidersHorizontal size={14} className="text-blue-900" />
              <span>Bộ lọc</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-900" />
              )}
            </button>

            {/* Số lượng sản phẩm */}
            <span className="text-xs sm:text-sm font-semibold text-stone-600">
              Hiển thị <strong className="text-stone-900 font-bold">{filtered.length}</strong> sản phẩm
            </span>

            {/* Dropdown sắp xếp hiện đại */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-stone-500 font-medium hidden sm:inline-flex items-center gap-1">
                <ArrowUpDown size={13} /> Sắp xếp:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-xs sm:text-sm border border-stone-200/90 rounded-xl px-3 py-2 bg-white text-stone-800 font-medium outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 shadow-2xs cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dải thẻ bộ lọc đang kích hoạt (Active filter tags) */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap mb-6">
              <span className="text-xs font-semibold text-stone-400">Đang chọn:</span>

              {filters.gender && filters.gender !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                  Đồ {filters.gender}
                  <button
                    type="button"
                    onClick={() => removeFilter('gender')}
                    className="hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {categoryLabel && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-950 border border-blue-200">
                  {categoryLabel}
                  <button
                    type="button"
                    onClick={() => removeFilter('category')}
                    className="hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.priceRange && filters.priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                  {PRICE_RANGES.find((r) => r.id === filters.priceRange)?.label}
                  <button
                    type="button"
                    onClick={() => removeFilter('priceRange')}
                    className="hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {filters.colors.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200 uppercase"
                >
                  Màu {c}
                  <button
                    type="button"
                    onClick={() => removeFilter('colors', c)}
                    className="hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {filters.sizes.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200"
                >
                  Size {s}
                  <button
                    type="button"
                    onClick={() => removeFilter('sizes', s)}
                    className="hover:text-rose-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-1 hover:underline"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Lưới sản phẩm */}
          {loading ? (
            <ProductGridSkeleton />
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center shadow-2xs my-4">
              <EmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description="Hãy thử điều chỉnh lại bộ lọc giá, màu sắc hoặc từ khóa tìm kiếm để khám phá thêm nhiều mẫu thiết kế khác."
              />
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
              >
                <RotateCcw size={14} /> Xóa toàn bộ bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Bộ lọc cho Mobile */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-white p-5 overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
              <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-blue-900" /> Bộ lọc sản phẩm
              </h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Đóng"
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1">
              <ProductFilters filters={filters} onChange={handleFilterChange} />
            </div>

            <div className="pt-4 mt-6 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all"
              >
                Xem {filtered.length} kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
