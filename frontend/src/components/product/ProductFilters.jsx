import { categories, colors, sizes } from '../../data/categories'

const PRICE_RANGES = [
  { id: 'all', label: 'Tất cả mức giá', min: 0, max: Infinity },
  { id: 'r1', label: 'Dưới 300.000đ', min: 0, max: 300000 },
  { id: 'r2', label: '300.000đ - 700.000đ', min: 300000, max: 700000 },
  { id: 'r3', label: 'Trên 700.000đ', min: 700000, max: Infinity },
]

export { PRICE_RANGES }

export default function ProductFilters({ filters, onChange }) {
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

  return (
    <div className="space-y-8">
      <div>
        <h4 className="text-sm font-medium mb-3">Danh mục</h4>
        <div className="space-y-2">
          <button
            onClick={() => onChange({ ...filters, category: 'all' })}
            className={`block text-sm ${filters.category === 'all' ? 'text-clay font-medium' : 'text-ink-soft'}`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onChange({ ...filters, category: c.id })}
              className={`block text-sm ${filters.category === c.id ? 'text-clay font-medium' : 'text-ink-soft'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Khoảng giá</h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <label key={r.id} className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
              <input
                type="radio"
                name="price"
                checked={filters.priceRange === r.id}
                onChange={() => onChange({ ...filters, priceRange: r.id })}
                className="accent-clay"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Màu sắc</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleColor(c.id)}
              title={c.name}
              aria-label={c.name}
              className={`h-7 w-7 rounded-full border-2 ${
                filters.colors.includes(c.id) ? 'border-clay' : 'border-transparent'
              }`}
              style={{ backgroundColor: c.hex, boxShadow: '0 0 0 1px #cdc6b3' }}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-3">Kích thước</h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`h-8 min-w-8 px-2 text-xs border rounded-sm ${
                filters.sizes.includes(s)
                  ? 'border-ink bg-ink text-ivory'
                  : 'border-stone-dark text-ink-soft'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
