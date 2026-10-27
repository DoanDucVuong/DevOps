import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Truck, Landmark, Wallet, Ticket, Tag, X, CreditCard } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useOrderStore } from '../../store/orderStore'
import { createOrder, createPaymentUrl, applyVoucher, IS_BACKEND } from '../../api/client'
import { formatCurrency } from '../../utils/format'
import { useToast } from '../../components/common/Toast'

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck, desc: 'Thanh toán bằng tiền mặt khi nhận kiện hàng' },
  { id: 'vnpay', label: 'Cổng thanh toán VNPAY (ATM / QR / Visa)', icon: CreditCard, badge: 'Khuyên dùng', desc: 'Thanh toán tức thì qua thẻ ATM nội địa, QR Pay hoặc thẻ Quốc tế' },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: Landmark, desc: 'Chuyển khoản thủ công qua số tài khoản ngân hàng' },
  { id: 'wallet', label: 'Ví điện tử', icon: Wallet, desc: 'Thanh toán qua ví MoMo, ZaloPay' },
]

export default function Checkout() {
  const { showToast } = useToast()
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clearCart)
  const cartVoucher = useCartStore((s) => s.appliedVoucher)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    note: '',
  })
  const [payment, setPayment] = useState('cod')
  const [orderId, setOrderId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const addOrder = useOrderStore((s) => s.addOrder)

  // Voucher state - tự động thừa hưởng nếu đã áp dụng ở giỏ hàng
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(cartVoucher)
  const [voucherError, setVoucherError] = useState('')
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  const shippingFee = totalPrice >= 500000 || totalPrice === 0 ? 0 : 30000
  const discountAmount = appliedVoucher ? Number(appliedVoucher.discountAmount || appliedVoucher.discount_amount || 0) : 0
  const grandTotal = Math.max(0, totalPrice - discountAmount + shippingFee)

  const handleApplyVoucher = async (e) => {
    e.preventDefault()
    if (!voucherInput.trim()) return
    setVoucherError('')
    setApplyingVoucher(true)
    try {
      const res = await applyVoucher(voucherInput.trim(), totalPrice)
      setAppliedVoucher(res)
      const codeName = res.code || res.voucher?.code || voucherInput.trim().toUpperCase()
      const savedAmount = res.discountAmount || res.discount_amount || 0
      showToast(`Áp dụng mã ${codeName} thành công (-${formatCurrency(savedAmount)})`)
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện.'
      setVoucherError(errMsg)
      showToast(errMsg)
      setAppliedVoucher(null)
    } finally {
      setApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
    setVoucherError('')
    showToast('Đã hủy áp dụng mã giảm giá.')
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (payment === 'vnpay' && IS_BACKEND) {
        const orderPayload = {
          items: items.map((i) => ({
            productId: i.productId || i.id,
            name: i.name,
            price: i.price,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            image: i.image,
          })),
          shipping_info: form,
          shipping: form,
          payment_method: 'vnpay',
          paymentMethod: 'vnpay',
          voucher_code: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
          voucherCode: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
          total_amount: grandTotal,
          frontend_url: window.location.origin,
        }
        const res = await createPaymentUrl(orderPayload)
        if (res.paymentUrl) {
          clearCart()
          showToast('Đang chuyển hướng tới cổng thanh toán VNPAY...')
          window.location.href = res.paymentUrl
          return
        }
      }

      if (IS_BACKEND) {
        const res = await createOrder({
          items: items.map((i) => ({
            productId: i.productId || i.id,
            name: i.name,
            price: i.price,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            image: i.image,
          })),
          shipping_info: form,
          shipping: form,
          payment_method: payment,
          paymentMethod: payment,
          voucher_code: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
          voucherCode: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
          total_amount: grandTotal,
        })
        const newOrderId = res.code || (res.orderId ? `DH${String(res.orderId).padStart(6, '0')}` : res.id)
        setOrderId(newOrderId)
        showToast('Đặt hàng thành công!')
      } else {
        const id = 'DH' + Date.now().toString().slice(-8)
        addOrder({
          id,
          userId: user?.email,
          date: new Date().toISOString(),
          items: items.map(({ productId, name, price, quantity, size, color }) => ({
            productId, name, price, quantity, size, color,
          })),
          total: grandTotal,
          status: 'pending',
        })
        setOrderId(id)
        showToast('Đặt hàng thành công!')
      }
      clearCart()
    } catch (err) {
      const errMsg =
        err.response?.status === 401
          ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
          : err.response?.data?.message || 'Không thể đặt hàng lúc này, vui lòng thử lại.'
      setError(errMsg)
      showToast(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="h-16 w-16 rounded-full bg-moss/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={30} className="text-moss" />
        </div>
        <h1 className="font-display text-3xl mb-3">Đặt hàng thành công</h1>
        <p className="text-ink-soft text-sm mb-1">Mã đơn hàng của bạn</p>
        <p className="font-display text-2xl mb-8">{orderId}</p>
        <p className="text-sm text-ink-soft mb-8">
          Cảm ơn bạn đã mua sắm tại Maison. Đơn hàng đã được ghi nhận — đây là hệ thống demo, không có giao dịch thanh toán thật.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 border border-stone-dark text-sm rounded-sm"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-2xl mb-3">Giỏ hàng trống</h1>
        <p className="text-sm text-ink-soft mb-6">Thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <button onClick={() => navigate('/products')} className="px-6 py-3 bg-ink text-ivory text-sm rounded-sm">
          Đi mua sắm
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-display text-3xl mb-8">Thanh toán</h1>

      <form onSubmit={handleConfirm} className="grid md:grid-cols-[1fr_360px] gap-10">
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-xl mb-4">Thông tin khách hàng</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                required
                placeholder="Họ và tên"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
              />
              <input
                required
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl mb-4">Địa chỉ giao hàng</h2>
            <div className="space-y-4">
              <input
                required
                placeholder="Địa chỉ (số nhà, đường)"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
              />
              <input
                required
                placeholder="Tỉnh / Thành phố"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
              />
              <textarea
                placeholder="Ghi chú (tuỳ chọn)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={3}
                className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink resize-none"
              />
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3.5 border rounded-sm p-3.5 cursor-pointer transition-all ${
                    payment === m.id ? 'border-ink bg-stone/10 shadow-xs' : 'border-stone-dark hover:border-ink/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="accent-clay mt-1"
                  />
                  <m.icon size={20} className={payment === m.id ? 'text-clay mt-0.5' : 'text-ink-soft mt-0.5'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{m.label}</span>
                      {m.badge && (
                        <span className="px-2 py-0.5 text-[10px] uppercase font-semibold bg-clay/10 text-clay rounded-full">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    {m.desc && <p className="text-xs text-ink-soft mt-0.5">{m.desc}</p>}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-stone rounded-sm p-6 h-fit">
          <h2 className="font-display text-xl mb-5">Đơn hàng của bạn</h2>
          <div className="space-y-4 mb-5 max-h-64 overflow-y-auto">
            {items.map((item) => (
              <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3">
                <img src={item.image} alt={item.name} className="h-14 w-12 object-cover rounded-sm bg-stone" />
                <div className="flex-1 text-sm">
                  <p className="font-medium line-clamp-1">{item.name}</p>
                  <p className="text-xs text-ink-soft">SL: {item.quantity}</p>
                </div>
                <span className="text-sm">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          {/* Voucher input block */}
          <div className="border-t border-stone pt-4 mb-4">
            <label className="block text-xs font-medium text-ink-soft mb-2 flex items-center gap-1.5">
              <Ticket size={14} className="text-clay" /> Mã giảm giá / Voucher
            </label>
            {appliedVoucher ? (
              <div className="flex items-center justify-between p-2.5 bg-moss/10 border border-moss/30 rounded-sm">
                <div className="flex items-center gap-2">
                  <Tag size={15} className="text-moss" />
                  <div>
                    <p className="text-xs font-semibold text-moss">
                      {appliedVoucher.voucher.code} (-{formatCurrency(appliedVoucher.discountAmount)})
                    </p>
                    <p className="text-[11px] text-ink-soft">Đã áp dụng giảm giá vào đơn</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  className="p-1 text-ink-soft hover:text-clay"
                  title="Gỡ bỏ mã"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    placeholder="VD: MAISON10, GIAM50K"
                    className="flex-1 border border-stone-dark rounded-sm px-3 py-1.5 text-xs bg-paper uppercase outline-none focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={applyingVoucher || !voucherInput.trim()}
                    className="px-3 py-1.5 bg-ink text-ivory text-xs rounded-sm hover:bg-ink-soft disabled:opacity-50 transition-colors shrink-0"
                  >
                    {applyingVoucher ? '...' : 'Áp dụng'}
                  </button>
                </div>
                {voucherError && (
                  <p className="text-xs text-clay mt-1.5">{voucherError}</p>
                )}
                <p className="text-[11px] text-ink-soft mt-1.5">
                  Thử các mã ưu đãi: <span className="font-mono text-clay font-medium">MAISON10</span> (-10%), <span className="font-mono text-clay font-medium">GIAM50K</span> (-50k)
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-stone pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Tạm tính</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-moss font-medium">
                <span className="flex items-center gap-1"><Tag size={13} /> Giảm giá voucher</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ink-soft">Vận chuyển</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-stone">
              <span>Tổng cộng</span>
              <span className="text-clay text-lg">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          {error && <p className="text-sm text-clay mt-4">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? (
              'Đang xử lý...'
            ) : payment === 'vnpay' ? (
              <>
                <CreditCard size={16} />
                Thanh toán qua VNPAY ({formatCurrency(grandTotal)})
              </>
            ) : (
              'Xác nhận đặt hàng'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
