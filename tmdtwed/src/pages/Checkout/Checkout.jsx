import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Truck, Landmark, Wallet } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency } from '../../utils/format'

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', icon: Truck },
  { id: 'bank', label: 'Chuyển khoản ngân hàng', icon: Landmark },
  { id: 'wallet', label: 'Ví điện tử', icon: Wallet },
]

export default function Checkout() {
  const items = useCartStore((s) => s.items)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clearCart)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    note: '',
  })
  const [payment, setPayment] = useState('cod')
  const [orderId, setOrderId] = useState(null)

  const shippingFee = totalPrice >= 500000 || totalPrice === 0 ? 0 : 30000
  const grandTotal = totalPrice + shippingFee

  const handleConfirm = (e) => {
    e.preventDefault()
    const id = 'DH' + Date.now().toString().slice(-8)
    setOrderId(id)
    clearCart()
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
          Cảm ơn bạn đã mua sắm tại Maison. Đây là mô phỏng — thông tin đơn hàng được lưu cục bộ, không có giao dịch thật.
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
                  className={`flex items-center gap-3 border rounded-sm px-4 py-3 cursor-pointer ${
                    payment === m.id ? 'border-ink' : 'border-stone-dark'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === m.id}
                    onChange={() => setPayment(m.id)}
                    className="accent-clay"
                  />
                  <m.icon size={18} className="text-ink-soft" />
                  <span className="text-sm">{m.label}</span>
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
          <div className="border-t border-stone pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Tạm tính</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Vận chuyển</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2">
              <span>Tổng cộng</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" className="w-full mt-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors">
            Xác nhận đặt hàng
          </button>
        </div>
      </form>
    </div>
  )
}
