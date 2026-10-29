import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCartStore, lineKey } from '../../store/cartStore'
import { colors as colorData } from '../../data/categories'
import { applyVoucher } from '../../api/client'
import { useToast } from '../../components/common/Toast'
import CartItem from './CartItem'
import CartSummary from './CartSummary'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const totalItemsCount = useCartStore((s) => s.totalItems())
  const appliedVoucher = useCartStore((s) => s.appliedVoucher)
  const setAppliedVoucher = useCartStore((s) => s.setAppliedVoucher)
  const removeAppliedVoucher = useCartStore((s) => s.removeAppliedVoucher)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [voucherInput, setVoucherInput] = useState('')
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  const colorName = (id) => colorData.find((c) => c.id === id)?.name || id

  const discountAmount = appliedVoucher
    ? Number(appliedVoucher.discountAmount || appliedVoucher.discount_amount || 0)
    : 0
  const finalSubtotal = Math.max(0, totalPrice - discountAmount)
  const shippingFee = totalPrice >= 500000 ? 0 : 30000
  const finalTotal = finalSubtotal + shippingFee

  const handleApplyVoucher = async (e) => {
    e?.preventDefault()
    if (!voucherInput.trim()) {
      showToast('Vui lòng nhập mã giảm giá.')
      return
    }
    setApplyingVoucher(true)
    try {
      const res = await applyVoucher(voucherInput.trim(), totalPrice)
      if (res && (res.success || res.valid)) {
        setAppliedVoucher(res)
        const codeName = res.code || res.voucher?.code || voucherInput.trim().toUpperCase()
        showToast(`Áp dụng mã ${codeName} thành công.`)
        setVoucherInput('')
      }
    } catch (err) {
      const errMsg =
        err?.response?.data?.message ||
        err.message ||
        'Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện.'
      showToast(errMsg)
    } finally {
      setApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    removeAppliedVoucher()
    showToast('Đã hủy áp dụng mã giảm giá.')
  }

  // Trường hợp Giỏ hàng trống (Uniqlo Minimalist Empty State)
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500">
          <ShoppingBag size={36} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-stone-900 dark:text-white mb-3">
          Giỏ hàng của bạn đang trống
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-8 leading-relaxed">
          Hiện tại chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá ngay các bộ sưu tập thiết kế mới nhất của Maison.
        </p>
        <Link
          to="/products"
          className="inline-block px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Nút quay lại mua sắm */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-stone-500 hover:text-black dark:text-stone-400 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Tiếp tục mua sắm
      </Link>

      {/* Tiêu đề giỏ hàng */}
      <div className="flex items-baseline justify-between border-b-2 border-stone-900 dark:border-stone-100 pb-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-stone-900 dark:text-white">
          Giỏ hàng
        </h1>
        <span className="text-sm font-semibold text-stone-600 dark:text-stone-400">
          [{totalItemsCount} sản phẩm]
        </span>
      </div>

      {/* Grid 2 cột: Cột trái danh sách (lg:col-span-8), Cột phải tóm tắt (lg:col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="lg:col-span-8">
          <div>
            {items.map((item) => {
              const key = lineKey(item)
              return (
                <CartItem
                  key={key}
                  item={item}
                  colorName={colorName}
                  onUpdateQuantity={(newQty) => updateQuantity(key, newQty)}
                  onRemove={() => {
                    removeItem(key)
                    showToast(`Đã xóa ${item.name} khỏi giỏ hàng.`)
                  }}
                />
              )
            })}
          </div>

          {/* Tiện ích dưới danh sách sản phẩm */}
          <div className="flex flex-wrap items-center justify-between pt-6 text-xs text-stone-500 dark:text-stone-400">
            <span>
              Mỗi sản phẩm đều được kiểm tra chất lượng kỹ lưỡng trước khi đóng gói và xuất xưởng.
            </span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
                  clearCart()
                  showToast('Đã làm trống giỏ hàng.')
                }
              }}
              className="hover:text-red-500 hover:underline transition-colors mt-2 sm:mt-0 cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* Cột phải: Khối Tổng đơn hàng (Tóm tắt chi phí) dính cố định (sticky) */}
        <div className="lg:col-span-4">
          <CartSummary
            totalPrice={totalPrice}
            appliedVoucher={appliedVoucher}
            discountAmount={discountAmount}
            shippingFee={shippingFee}
            finalTotal={finalTotal}
            voucherInput={voucherInput}
            setVoucherInput={setVoucherInput}
            applyingVoucher={applyingVoucher}
            handleApplyVoucher={handleApplyVoucher}
            handleRemoveVoucher={handleRemoveVoucher}
            onCheckout={() => navigate('/checkout')}
          />
        </div>
      </div>
    </div>
  )
}
