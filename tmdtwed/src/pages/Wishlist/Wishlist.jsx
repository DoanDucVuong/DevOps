import { Heart, X, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useWishlistStore } from '../../store/wishlistStore'
import { useCartStore } from '../../store/cartStore'
import { getProductById } from '../../data/products'
import { useToast } from '../../components/common/Toast'
import { formatCurrency } from '../../utils/format'
import EmptyState from '../../components/common/EmptyState'

export default function Wishlist() {
  const productIds = useWishlistStore((s) => s.productIds)
  const remove = useWishlistStore((s) => s.remove)
  const addItem = useCartStore((s) => s.addItem)
  const { showToast } = useToast()

  const items = productIds.map(getProductById).filter(Boolean)

  const moveToCart = (product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: product.colors[0],
      size: product.sizes[0],
      quantity: 1,
    })
    remove(product.id)
    showToast('Đã chuyển vào giỏ hàng')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <EmptyState
          icon={Heart}
          title="Danh sách yêu thích trống"
          description="Lưu lại những sản phẩm bạn thích để xem lại sau."
          actionLabel="Khám phá sản phẩm"
          actionTo="/products"
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-display text-3xl mb-8">Yêu thích ({items.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {items.map((product) => (
          <div key={product.id} className="group">
            <div className="relative aspect-[3/4] overflow-hidden bg-stone rounded-sm mb-3">
              <Link to={`/products/${product.id}`}>
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
              </Link>
              <button
                onClick={() => remove(product.id)}
                aria-label="Xoá khỏi yêu thích"
                className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-paper/90 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <Link to={`/products/${product.id}`} className="text-sm font-medium line-clamp-2 mb-1 block">
              {product.name}
            </Link>
            <p className="text-sm font-semibold mb-3">{formatCurrency(product.price)}</p>
            <button
              onClick={() => moveToCart(product)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-ink text-sm rounded-sm hover:bg-ink hover:text-ivory transition-colors"
            >
              <ShoppingBag size={14} /> Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
