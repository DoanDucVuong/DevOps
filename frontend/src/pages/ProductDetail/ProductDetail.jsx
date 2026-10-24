import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Heart, Minus, Plus, Truck, RefreshCw } from 'lucide-react'
import { useProductStore } from '../../store/productStore'
import { colors as colorData } from '../../data/categories'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useToast } from '../../components/common/Toast'
import { formatCurrency } from '../../utils/format'
import Rating from '../../components/common/Rating'
import ProductCard from '../../components/product/ProductCard'
import ProductReviews from '../../components/product/ProductReviews'
import { fetchSimilarProducts, recordInteraction } from '../../api/client'

export default function ProductDetail() {
  const { id } = useParams()
  const getProductById = useProductStore((s) => s.getProductById)
  const products = useProductStore((s) => s.products)
  const product = getProductById(id)

  const [activeImage, setActiveImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'den')
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M')
  const [quantity, setQuantity] = useState(1)
  const [related, setRelated] = useState([])
  const [relatedAlgo, setRelatedAlgo] = useState(null)

  const addItem = useCartStore((s) => s.addItem)
  const isWished = useWishlistStore((s) => product && s.isWished(product.id))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const { showToast } = useToast()

  // Ghi nhận hành vi "view" -> dữ liệu huấn luyện ML (mục 3.2.3 Interactions)
  useEffect(() => {
    if (!product) return
    recordInteraction(product.id, 'view')
  }, [product?.id])

  // "Sản phẩm tương tự / You May Also Like" — Content-based Filtering thật từ ML Service
  useEffect(() => {
    if (!product) return
    fetchSimilarProducts(product.id, 4)
      .then((data) => {
        const mapped = data.items.map((it) => getProductById(it.id)).filter(Boolean)
        setRelated(mapped.length > 0 ? mapped : fallbackRelated())
        setRelatedAlgo(data.algorithm)
      })
      .catch(() => {
        setRelated(fallbackRelated())
        setRelatedAlgo(null)
      })

    function fallbackRelated() {
      return products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)
    }
  }, [product?.id])

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
    recordInteraction(product.id, 'cart')
    showToast('Đã thêm vào giỏ hàng')
  }



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
            <img
              src={product.images[activeImage]}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = product.gender === 'Nữ'
                  ? 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80'
                  : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
              }}
              className="w-full h-full object-cover"
            />
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
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-clay/10 text-clay border border-clay/30 uppercase tracking-wide">
              {product.gender === 'Nam' ? 'Đồ Nam' : product.gender === 'Nữ' ? 'Đồ Nữ' : 'Unisex'}
            </span>
          </div>
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

      {/* Đánh giá & Bình luận khách hàng */}
      <ProductReviews
        productId={product.id}
        initialAvgRating={Number(product.rating || product.avg_rating || 5)}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl mb-1">Có thể bạn cũng thích</h2>
          {relatedAlgo ? (
            <p className="text-xs text-ink-soft mb-6">
              Gợi ý bằng Content-based Filtering (TF-IDF + Cosine Similarity)
            </p>
          ) : (
            <div className="mb-6" />
          )}
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
