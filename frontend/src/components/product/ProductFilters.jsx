import { useState } from 'react'
import { SlidersHorizontal, RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { colors, sizes } from '../../data/categories'
import { useCategoryStore } from '../../store/categoryStore'

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', short: 'Tất cả giá', min: 0, max: Infinity },
  { id: 'r1', label: 'Dưới 300.000đ', short: '< 300.000đ', min: 0, max: 300000 },
  { id: 'r2', label: '300.000đ - 700.000đ', short: '300K - 700K', min: 300000, max: 700000 },
  { id: 'r3', label: 'Trên 700.000đ', short: '> 700.000đ', min: 700000, max: Infinity },
]

export { PRICE_RANGES }

export default function ProductFilters({ filters, onChange }) {
  const categories = useCategoryStore((s) => s.categories)
  const [categoriesOpen, setCategoriesOpen] = useState(true)

  const toggleColor = (id) => {
    const set = new Set(filters.colors)
    set.has(id) ? set.delete(id) : set.add(id)
    onChange({ ...filters, colors: [...set] })
  }

  const toggleSize = (s) => {
    const set = new Set(filters.sizes)
    set.has(s) ? set.delete(s) : set.add(s)
    onChange({ ...filters, sizes: [...set] })
  }

  const hasActiveFilters =
    (filters.gender && filters.gender !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    (filters.priceRange && filters.priceRange !== 'all') ||
    (filters.colors && filters.colors.length > 0) ||
    (filters.sizes && filters.sizes.length > 0)

  const handleReset = () => {
    onChange({
      gender: 'all',
      category: 'all',
      priceRange: 'all',
      colors: [],
      sizes: [],
    })
  }

  // Lọc danh mục phù hợp theo giới tính đã chọn (nếu có)
  const displayCategories = categories.filter((c) => {
    if (!filters.gender || filters.gender === 'all') return true
    return !c.gender_group || c.gender_group === 'Chung' || c.gender_group === filters.gender
  })

  const currentCategoryName = categories.find((c) => c.id === filters.category)?.name

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Tiêu đề & Nút đặt lại bộ lọc */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-blue-900" /> Bộ lọc tìm kiếm
        </h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-blue-900 hover:text-blue-700 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={11} /> Đặt lại
          </button>
        )}
      </div>

      {/* 1. Phân loại đối tượng (Segmented control) */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Đối tượng
        </h4>
        <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Nam', label: 'Đồ Nam' },
            { id: 'Nữ', label: 'Đồ Nữ' },
          ].map((g) => {
            const isSelected = (filters.gender || 'all') === g.id
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onChange({ ...filters, gender: g.id })}
                className={`py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-stone-900 shadow-2xs font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {g.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Khoảng giá — ĐƯỢC ĐƯA LÊN NGAY ĐẦU (Dạng lưới 2x2) để nhìn thấy ngay lập tức mà không cần cuộn! */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Khoảng giá
          </h4>
          {filters.priceRange && filters.priceRange !== 'all' && (
            <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
              {PRICE_RANGES.find((r) => r.id === filters.priceRange)?.short}
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_RANGES.map((r) => {
            const isSelected = (filters.priceRange || 'all') === r.id
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onChange({ ...filters, priceRange: r.id })}
                className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-blue-900 bg-blue-900 text-white shadow-2xs font-bold'
                    : 'border-stone-200/90 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <span>{r.short}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Danh mục sản phẩm (Gọn gàng, có thể thu gọn/mở rộng) */}
      <div>
        <button
          type="button"
          onClick={() => setCategoriesOpen((prev) => !prev)}
          className="w-full flex items-center justify-between py-1 text-left group"
        >
          <div className="flex items-center gap-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 group-hover:text-stone-800">
              Danh mục
            </h4>
            {filters.category && filters.category !== 'all' && (
              <span className="text-[10px] font-bold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                {currentCategoryName}
              </span>
            )}
          </div>
          {categoriesOpen ? (
            <ChevronUp size={14} className="text-stone-400" />
          ) : (
            <ChevronDown size={14} className="text-stone-400" />
          )}
        </button>

        {categoriesOpen && (
          <div className="space-y-0.5 mt-1 pt-1 border-t border-stone-100 max-h-52 overflow-y-auto scrollbar-thin">
            <button
              type="button"
              onClick={() => onChange({ ...filters, category: 'all' })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                filters.category === 'all'
                  ? 'bg-blue-50/80 text-blue-900 font-bold'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-medium'
              }`}
            >
              <span>Tất cả danh mục</span>
              {filters.category === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
            </button>

            {displayCategories.map((c) => {
              const isSelected = filters.category === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChange({ ...filters, category: c.id })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 font-bold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-medium'
                  }`}
                >
                  <span>{c.name}</span>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Màu sắc */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Màu sắc {filters.colors.length > 0 && `(${filters.colors.length})`}
        </h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const isSelected = filters.colors.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleColor(c.id)}
                title={c.name}
                aria-label={c.name}
                className={`h-6 w-6 rounded-full border transition-all flex items-center justify-center ${
                  isSelected
                    ? 'ring-2 ring-stone-900 ring-offset-2 border-white scale-110 shadow-2xs'
                    : 'border-stone-300 hover:scale-105 opacity-90 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {isSelected && (
                  <Check
                    size={11}
                    className={c.id === 'trang' || c.id === 'be' ? 'text-stone-900' : 'text-white'}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Kích thước */}
      <div>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
          Kích thước {filters.sizes.length > 0 && `(${filters.sizes.length})`}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => {
            const isSelected = filters.sizes.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`h-7 min-w-[34px] px-2 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center ${
                  isSelected
                    ? 'border-2 border-stone-900 bg-stone-900 text-white font-bold shadow-2xs'
                    : 'border-stone-200 text-stone-700 bg-white hover:border-stone-400'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
