import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Tag, Ticket, X, ShieldCheck, RefreshCw, Truck } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

export default function CartSummary({
  totalPrice,
  appliedVoucher,
  discountAmount,
  shippingFee,
  finalTotal,
  voucherInput,
  setVoucherInput,
  applyingVoucher,
  handleApplyVoucher,
  handleRemoveVoucher,
  onCheckout,
}) {
  const [voucherOpen, setVoucherOpen] = useState(Boolean(appliedVoucher))

  return (
    <div className="sticky top-24 bg-[#f4f4f4] dark:bg-stone-900 p-6 sm:p-7 rounded-sm">
      <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 dark:text-white pb-3 border-b border-stone-200/80 dark:border-stone-800">
        Tóm tắt đơn hàng
      </h2>

      {/* Thông báo tiến độ Miễn phí vận chuyển */}
      <div className="py-3 text-xs text-stone-600 dark:text-stone-400 border-b border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
        <Truck size={15} className="shrink-0 text-stone-700 dark:text-stone-300" />
        {totalPrice >= 500000 ? (
          <span className="text-emerald-700 dark:text-emerald-400 font-medium">
            Đơn hàng đủ điều kiện Miễn phí vận chuyển
          </span>
        ) : (
          <span>
            Mua thêm <strong className="text-stone-900 dark:text-white">{formatCurrency(500000 - totalPrice)}</strong> để được Miễn phí vận chuyển
          </span>
        )}
      </div>

      {/* Các dòng thông tin chi phí */}
      <div className="py-4 space-y-2.5 text-sm">
        <div className="flex justify-between text-stone-800 dark:text-stone-200">
          <span>Tạm tính</span>
          <span className="font-medium text-stone-900 dark:text-white">{formatCurrency(totalPrice)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Tag size={13} />
              Mã giảm giá ({appliedVoucher?.code || appliedVoucher?.voucher?.code})
            </span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between text-stone-800 dark:text-stone-200">
          <span>Phí vận chuyển dự kiến</span>
          <span className="font-medium text-stone-900 dark:text-white">
            {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
          </span>
        </div>
      </div>

      {/* Tùy chọn Voucher/Quà tặng dạng Accordion */}
      <div className="border-t border-stone-200/80 dark:border-stone-800 py-3">
        <button
          type="button"
          onClick={() => setVoucherOpen((prev) => !prev)}
          className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200 hover:text-black dark:hover:text-white py-1 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Ticket size={14} />
            Mã ưu đãi / Phiếu quà tặng
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${voucherOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {voucherOpen && (
          <div className="mt-3 pt-1">
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 rounded-sm border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 min-w-0">
                  <Tag size={14} className="text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-bold text-stone-900 dark:text-white uppercase block truncate">
                      {appliedVoucher.code || appliedVoucher.voucher?.code}
                    </span>
                    <span className="text-[11px] text-emerald-600">
                      Đã giảm {formatCurrency(discountAmount)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 ml-2 transition-colors cursor-pointer"
                  aria-label="Xóa mã giảm giá"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <input
                  type="text"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="MÃ GIẢM GIÁ (VD: MAISON10)"
                  className="flex-1 min-w-0 border border-stone-300 dark:border-stone-700 rounded-sm px-3 py-2 text-xs bg-white dark:bg-stone-800 text-stone-900 dark:text-white uppercase placeholder:normal-case placeholder:text-stone-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={applyingVoucher || !voucherInput.trim()}
                  className="px-4 py-2 bg-black text-white text-xs font-bold uppercase rounded-sm hover:bg-stone-800 disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
                >
                  {applyingVoucher ? '...' : 'Áp dụng'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Dòng Tổng đơn đặt hàng */}
      <div className="border-t border-stone-300 dark:border-stone-700 pt-4 mt-2">
        <div className="flex justify-between items-baseline">
          <span className="text-base sm:text-lg font-bold text-stone-900 dark:text-white uppercase tracking-wide">
            Tổng đơn đặt hàng
          </span>
          <span className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white tracking-tight">
            {formatCurrency(finalTotal)}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 text-right mt-1">
          Đã bao gồm thuế giá trị gia tăng (VAT)
        </p>
      </div>

      {/* Các dòng text lưu ý nhỏ bên trên nút */}
      <div className="mt-5 mb-3 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
        Phí vận chuyển chính xác, thông tin giao nhận và lựa chọn phương thức thanh toán (COD, VNPay, VietQR) sẽ được xác nhận ở bước kế tiếp.
      </div>

      {/* Nút THANH TOÁN (Checkout) */}
      <button
        type="button"
        onClick={onCheckout}
        className="w-full py-4 bg-black text-white font-bold text-sm tracking-wider uppercase rounded-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-none cursor-pointer"
      >
        <span>Tiến hành thanh toán</span>
      </button>

      {/* Link tiếp tục mua sắm */}
      <Link
        to="/products"
        className="w-full mt-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white hover:underline transition-colors block"
      >
        Tiếp tục mua sắm
      </Link>

      {/* Tiện ích bảo đảm Uniqlo */}
      <div className="mt-6 pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-2 text-stone-600 dark:text-stone-400 text-[11px]">
        <div className="flex items-center gap-2">
          <RefreshCw size={13} className="shrink-0 text-stone-500" />
          <span>Đổi trả sản phẩm thuận tiện trong vòng 30 ngày</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="shrink-0 text-stone-500" />
          <span>Cam kết 100% hàng chính hãng Maison Quality</span>
        </div>
      </div>
    </div>
  )
}
