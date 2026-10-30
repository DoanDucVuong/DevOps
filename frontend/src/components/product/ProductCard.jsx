import { Link } from 'react-router-dom'
import { Heart, Eye, Star } from 'lucide-react'
import { useWishlistStore } from '../../store/wishlistStore'
import { useToast } from '../common/Toast'
import { formatCurrency } from '../../utils/format'
import { colors as colorData } from '../../data/categories'

export default function ProductCard({ product }) {
  const isWished = useWishlistStore((s) => s.isWished(product.id))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const { showToast } = useToast()

  const handleWishClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWish(product.id)
    showToast(isWished ? 'Đã bỏ khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích')
  }

  // Chuẩn hóa ảnh hiển thị
  const imageList = Array.isArray(product.images)
    ? product.images
    : typeof product.images === 'string'
    ? (() => {
        try {
          return JSON.parse(product.images)
        } catch {
          return [product.images]
        }
      })()
    : product.image
    ? [product.image]
    : []

  const displayImage =
    imageList[0] ||
    product.image_url ||
    (product.gender === 'Nữ'
      ? 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80')

  const oldPrice = product.oldPrice || (product.price ? Math.round(product.price * 1.25) : 0)
  const discountPercent =
    oldPrice > product.price ? Math.round(((oldPrice - product.price) / oldPrice) * 100) : 0

  const availableColors = product.colors || []

  return (
    <Link to={`/products/${product.id}`} className="group flex flex-col h-full select-none">
      {/* Khung ảnh chính bo tròn cao cấp */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100 dark:bg-slate-900 mb-3 border border-stone-200/70 dark:border-slate-800 shadow-2xs group-hover:shadow-md group-hover:border-stone-300 dark:group-hover:border-slate-700 transition-all duration-300">
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src =
              product.gender === 'Nữ'
                ? 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80'
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Huy hiệu Mới */}
        {product.isNew && (
          <span className="absolute top-2.5 left-2.5 bg-stone-900/90 text-white backdrop-blur-xs text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-xs">
            Mới
          </span>
        )}

        {/* Huy hiệu Giảm giá */}
        {discountPercent > 0 && (
          <span
            className="absolute left-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider shadow-xs"
            style={{ top: product.isNew ? '2.1rem' : '0.625rem' }}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Nút Yêu thích nổi trên góc phải */}
        <button
          type="button"
          onClick={handleWishClick}
          aria-label="Thêm vào yêu thích"
          className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-stone-700 dark:text-stone-300 shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-10"
        >
          <Heart
            size={15}
            className={isWished ? 'fill-rose-500 text-rose-500' : 'hover:text-rose-500'}
          />
        </button>

        {/* Nút Xem chi tiết nhanh trượt lên khi hover */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
          <div className="w-full py-2 bg-white/95 dark:bg-slate-900/95 text-stone-900 dark:text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md backdrop-blur-xs flex items-center justify-center gap-1.5 border border-stone-200/80 dark:border-slate-700">
            <Eye size={14} /> Xem chi tiết
          </div>
        </div>
      </div>

      {/* Thông tin mô tả sản phẩm */}
      <div className="flex flex-col flex-1 space-y-1">
        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
          <span>{product.gender ? `Đồ ${product.gender}` : 'Thời trang Maison'}</span>
          {Number(product.sold_count || 0) > 0 && (
            <span className="text-stone-500 dark:text-stone-400">Đã bán {product.sold_count}</span>
          )}
        </div>

        <h3
          className="text-sm font-semibold text-stone-900 dark:text-stone-100 group-hover:text-blue-900 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.5rem] leading-snug"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Cụm Giá tiền & Tùy chọn màu được đẩy sát đáy thẻ */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-blue-950 dark:text-blue-400 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {oldPrice > product.price && (
              <span className="text-xs text-stone-400 line-through font-normal">
                {formatCurrency(oldPrice)}
              </span>
            )}
          </div>

          {/* Xem trước dải màu sắc (Color dots preview) */}
          {availableColors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1.5">
              {availableColors.slice(0, 4).map((cId) => {
                const hex = colorData.find((c) => c.id === cId)?.hex || '#17181a'
                return (
                  <span
                    key={cId}
                    className="w-2.5 h-2.5 rounded-full border border-stone-300 dark:border-slate-600 shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                )
              })}
              {availableColors.length > 4 && (
                <span className="text-[10px] text-stone-400 font-medium leading-none">
                  +{availableColors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
