import { Star } from 'lucide-react'

export default function Rating({ value, size = 14, showValue = true }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={size}
            className={i < Math.round(value) ? 'fill-gold text-gold' : 'text-stone-dark'}
          />
        ))}
      </div>
      {showValue && <span className="text-xs text-ink-soft">{value.toFixed(1)}</span>}
    </div>
  )
}
