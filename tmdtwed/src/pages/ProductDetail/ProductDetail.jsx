import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Heart, Minus, Plus, Truck, RefreshCw } from 'lucide-react'
import { getProductById, products } from '../../data/products'
import { colors as colorData } from '../../data/categories'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useToast } from '../../components/common/Toast'
import { formatCurrency } from '../../utils/format'
import Rating from '../../components/common/Rating'
import ProductCard from '../../components/product/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product?.colors[0])
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0])
  const [quantity, setQuantity] = useState(1)

  const addItem = useCartStore((s) => s.addItem)
  const isWished = useWishlistStore((s) => product && s.isWished(product.id))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const { showToast } = useToast()

  if (!product) return <Navigate to="/404" replace />

  const colorName = (id) => colorData.find((c) => c.id === id)?.name || id
  const colorHex = (id) => colorData.find((c) => c.id === id)?.hex || '#ccc'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: selectedColor,
      size: selectedSize,
      quantity,
    })
    showToast('Đã thêm vào giỏ hàng')
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <nav className="text-xs text-ink-soft mb-6">
        <Link to="/" className="hover:text-clay">Trang chủ</Link> /{' '}
        <Link to="/products" className="hover:text-clay">Sản phẩm</Link> /{' '}
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-[3/4] rounded-sm overflow-hidden bg-stone mb-3">
            <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`h-20 w-16 rounded-sm overflow-hidden border-2 ${
                  activeImage === i ? 'border-clay' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl mb-2">{product.name}</h1>
          <Rating value={product.rating} />
          <div className="flex items-center gap-3 mt-4 mb-6">
            <span className="text-2xl font-semibold">{formatCurrency(product.price)}</span>
            {product.oldPrice && (
              <span className="text-base text-ink-soft line-through">{formatCurrency(product.oldPrice)}</span>
            )}
          </div>
          <p className="text-sm text-ink-soft leading-relaxed mb-8">{product.description}</p>

          <div className="mb-6">
            <p className="text-sm font-medium mb-3">Màu sắc: {colorName(selectedColor)}</p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: colorHex(c) }}
                  className={`h-9 w-9 rounded-full border-2 ${
                    selectedColor === c ? 'border-clay' : 'border-transparent'
                  }`}
                  aria-label={colorName(c)}
                />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-sm font-medium mb-3">Kích thước</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`h-10 min-w-10 px-3 text-sm border rounded-sm ${
                    selectedSize === s ? 'border-ink bg-ink text-ivory' : 'border-stone-dark text-ink-soft'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-stone-dark rounded-sm">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-11 w-11 flex items-center justify-center"
                aria-label="Giảm số lượng"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="h-11 w-11 flex items-center justify-center"
                aria-label="Tăng số lượng"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className="flex-1 h-11 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
            >
              Thêm vào giỏ hàng
            </button>
            <button
              onClick={() => {
                toggleWish(product.id)
                showToast(isWished ? 'Đã bỏ khỏi yêu thích' : 'Đã thêm vào yêu thích')
              }}
              className="h-11 w-11 border border-stone-dark rounded-sm flex items-center justify-center shrink-0"
              aria-label="Yêu thích"
            >
              <Heart size={18} className={isWished ? 'fill-clay text-clay' : ''} />
            </button>
          </div>

          <div className="border-t border-stone pt-6 space-y-3 text-sm text-ink-soft">
            <div className="flex items-center gap-3">
              <Truck size={18} /> Miễn phí vận chuyển cho đơn từ 500.000đ
            </div>
            <div className="flex items-center gap-3">
              <RefreshCw size={18} /> Đổi trả miễn phí trong 30 ngày
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl mb-6">Có thể bạn cũng thích</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
