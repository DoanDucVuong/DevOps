import { Star } from 'lucide-react'

export default function Rating({ value, size = 14, showValue = true }) {
  const numValue = Number(value) || 0
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={numValue > 0 && i < Math.round(numValue) ? 'fill-gold text-gold' : 'text-stone-dark'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs text-ink-soft">
          {numValue > 0 ? `${numValue.toFixed(1)} / 5` : 'Chưa có đánh giá'}
        </span>
      )}
    </div>
  )
}
