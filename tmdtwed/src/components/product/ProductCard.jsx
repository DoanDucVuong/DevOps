import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '../../store/wishlistStore'
import { useToast } from '../common/Toast'
import { formatCurrency } from '../../utils/format'

export default function ProductCard({ product }) {
  const isWished = useWishlistStore((s) => s.isWished(product.id))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const { showToast } = useToast()

  const handleWishClick = (e) => {
    e.preventDefault()
    toggleWish(product.id)
    showToast(isWished ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích')
  }

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-stone rounded-sm mb-3">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
        />
        {product.isNew && (
          <span className="absolute top-2.5 left-2.5 bg-ink text-ivory text-[11px] px-2 py-1 rounded-sm">
            Mới
          </span>
        )}
        {product.oldPrice && (
          <span className="absolute top-2.5 left-2.5 bg-clay text-ivory text-[11px] px-2 py-1 rounded-sm" style={product.isNew ? { top: '2.4rem' } : {}}>
            Sale
          </span>
        )}
        <button
          onClick={handleWishClick}
          aria-label="Thêm vào yêu thích"
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-paper/90 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Heart size={16} className={isWished ? 'fill-clay text-clay' : 'text-ink'} />
        </button>
      </div>
      <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
        {product.oldPrice && (
          <span className="text-xs text-ink-soft line-through">{formatCurrency(product.oldPrice)}</span>
        )}
      </div>
    </Link>
  )
}
