import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, Tag, Ticket, X } from 'lucide-react'
import { useCartStore, lineKey } from '../../store/cartStore'
import { colors as colorData } from '../../data/categories'
import { formatCurrency } from '../../utils/format'
import EmptyState from '../../components/common/EmptyState'
import { applyVoucher } from '../../api/client'
import { useToast } from '../../components/common/Toast'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const appliedVoucher = useCartStore((s) => s.appliedVoucher)
  const setAppliedVoucher = useCartStore((s) => s.setAppliedVoucher)
  const removeAppliedVoucher = useCartStore((s) => s.removeAppliedVoucher)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [voucherInput, setVoucherInput] = useState('')
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  const colorName = (id) => colorData.find((c) => c.id === id)?.name || id

  const discountAmount = appliedVoucher ? Number(appliedVoucher.discountAmount || appliedVoucher.discount_amount || 0) : 0
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
      // TUYỆT ĐỐI KHÔNG DÙNG Optimistic UI: Chỉ cập nhật khi API 200 OK thành công!
      if (res && (res.success || res.valid)) {
        setAppliedVoucher(res)
        const codeName = res.code || res.voucher?.code || voucherInput.trim().toUpperCase()
        const savedAmount = res.discountAmount || res.discount_amount || 0
        showToast(`Áp dụng mã ${codeName} thành công (-${formatCurrency(savedAmount)})`)
        setVoucherInput('')
      }
    } catch (err) {
      // Bắt lỗi HTTP 400/404 và hiển thị Toast thông báo lỗi rõ ràng bằng tiếng Việt
      const errMsg = err?.response?.data?.message || err.message || 'Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện.'
      showToast(errMsg)
    } finally {
      setApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    removeAppliedVoucher()
    showToast('Đã hủy áp dụng mã giảm giá.')
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <EmptyState
          icon={ShoppingBag}
          title="Giỏ hàng của bạn đang trống"
          description="Khám phá bộ sưu tập của Maison và thêm những món đồ bạn yêu thích."
          actionLabel="Tiếp tục mua sắm"
          actionTo="/products"
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-display text-3xl mb-8">Giỏ hàng ({items.length})</h1>

      <div className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="divide-y divide-stone">
          {items.map((item) => {
            const key = lineKey(item)
            return (
              <div key={key} className="flex gap-4 py-5">
                <Link to={`/products/${item.productId}`} className="h-28 w-24 rounded-sm overflow-hidden bg-stone shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link to={`/products/${item.productId}`} className="text-sm font-medium hover:text-clay">
                        {item.name}
                      </Link>
                      <p className="text-xs text-ink-soft mt-1">
                        {colorName(item.color)} / {item.size}
                      </p>
                    </div>
                    <button onClick={() => removeItem(key)} aria-label="Xoá sản phẩm" className="text-ink-soft hover:text-clay">
                      <Trash2 size={17} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center border border-stone-dark rounded-sm">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="h-8 w-8 flex items-center justify-center"
                        aria-label="Giảm số lượng"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="h-8 w-8 flex items-center justify-center"
                        aria-label="Tăng số lượng"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="border border-stone rounded-sm p-6 h-fit">
          <h2 className="font-display text-xl mb-5">Tóm tắt đơn hàng</h2>

          {/* Ô nhập mã Voucher */}
          {appliedVoucher ? (
            <div className="flex items-center justify-between p-3 bg-moss/10 border border-moss/30 rounded-sm mb-4">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-moss" />
                <div>
                  <span className="text-xs font-semibold text-ink block">
                    {appliedVoucher.code || appliedVoucher.voucher?.code}
                  </span>
                  <span className="text-[11px] text-moss">Giảm {formatCurrency(discountAmount)}</span>
                </div>
              </div>
              <button
                onClick={handleRemoveVoucher}
                className="text-ink-soft hover:text-clay p-1 transition-colors"
                aria-label="Xóa mã giảm giá"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyVoucher} className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5 flex items-center gap-1.5">
                <Ticket size={14} className="text-clay" />
                Mã giảm giá / Voucher
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã (VD: MAISON10)"
                  className="flex-1 border border-stone-dark rounded-sm px-3 py-2 text-xs bg-white outline-none focus:border-ink uppercase transition-colors"
                />
                <button
                  type="submit"
                  disabled={applyingVoucher || !voucherInput.trim()}
                  className="px-4 py-2 bg-ink text-ivory text-xs font-medium rounded-sm hover:bg-ink-soft transition-colors disabled:opacity-50"
                >
                  {applyingVoucher ? '...' : 'Áp dụng'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2 border-t border-stone pt-4 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Tạm tính</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-moss font-medium">
                <span className="flex items-center gap-1">
                  <Tag size={13} /> Giảm giá voucher
                </span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Phí vận chuyển</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
            </div>
          </div>

          <div className="flex justify-between text-base font-semibold border-t border-stone pt-4 mb-6">
            <span>Tổng cộng</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
          >
            Tiến hành thanh toán
          </button>
          <Link to="/products" className="block text-center text-sm text-clay mt-4 hover:underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
