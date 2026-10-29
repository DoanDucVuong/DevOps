import { Link } from 'react-router-dom'
import { Minus, Plus, Heart } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { useWishlistStore } from '../../store/wishlistStore'
import { useToast } from '../../components/common/Toast'

export default function CartItem({ item, onUpdateQuantity, onRemove, colorName }) {
  const isWished = useWishlistStore((s) => s.isWished(item.productId))
  const toggleWish = useWishlistStore((s) => s.toggle)
  const { showToast } = useToast()

  const handleToggleWishlist = (e) => {
    e.preventDefault()
    toggleWish(item.productId)
    showToast(isWished ? 'Đã xóa khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích')
  }

  return (
    <div className="flex gap-4 sm:gap-6 py-6 border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Hình ảnh bên trái: không bo góc (rounded-sm) */}
      <Link
        to={`/products/${item.productId}`}
        className="w-24 sm:w-28 md:w-32 aspect-[3/4] shrink-0 bg-stone-100 dark:bg-stone-800 rounded-sm overflow-hidden block"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </Link>

      {/* Thông tin bên phải ảnh */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Tên sản phẩm & nút Wishlist ở góc phải */}
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/products/${item.productId}`}
              className="text-sm sm:text-base font-medium text-stone-900 dark:text-white hover:text-stone-600 dark:hover:text-stone-300 transition-colors line-clamp-2"
            >
              {item.name}
            </Link>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className="p-1 -mr-1 text-stone-400 hover:text-red-500 transition-colors shrink-0"
              aria-label={isWished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              title={isWished ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart
                size={18}
                className={isWished ? 'fill-red-500 text-red-500' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}
              />
            </button>
          </div>

          {/* Phân loại Màu sắc, Kích cỡ */}
          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Màu sắc: <strong className="font-normal text-stone-800 dark:text-stone-200">{colorName(item.color)}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <span>
              Kích cỡ: <strong className="font-normal text-stone-800 dark:text-stone-200">{item.size}</strong>
            </span>
          </div>

          {/* Giá tiền nổi bật */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
              {formatCurrency(item.price)}
            </span>
            {item.quantity > 1 && (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                (Tổng: {formatCurrency(item.price * item.quantity)})
              </span>
            )}
          </div>
        </div>

        {/* Nút thao tác: Bộ điều chỉnh số lượng [ - 1 + ] & Nút Xóa */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-1">
          {/* Bộ điều chỉnh số lượng [ - 1 + ] dạng viền mỏng */}
          <div className="inline-flex items-center border border-stone-300 dark:border-stone-700 rounded-sm bg-white dark:bg-stone-900">
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              aria-label="Giảm số lượng"
              className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              <Minus size={13} strokeWidth={2.2} />
            </button>
            <span className="w-9 text-center text-sm font-semibold text-stone-900 dark:text-white select-none">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              aria-label="Tăng số lượng"
              className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <Plus size={13} strokeWidth={2.2} />
            </button>
          </div>

          {/* Nút Xóa dạng text link */}
          <button
            type="button"
            onClick={onRemove}
            className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:underline transition-colors py-1 cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}
