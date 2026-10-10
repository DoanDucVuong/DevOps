import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore, lineKey } from '../../store/cartStore'
import { colors as colorData } from '../../data/categories'
import { formatCurrency } from '../../utils/format'
import EmptyState from '../../components/common/EmptyState'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const totalPrice = useCartStore((s) => s.totalPrice())
  const navigate = useNavigate()

  const colorName = (id) => colorData.find((c) => c.id === id)?.name || id

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
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ink-soft">Tạm tính</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4">
            <span className="text-ink-soft">Phí vận chuyển</span>
            <span>{totalPrice >= 500000 ? 'Miễn phí' : formatCurrency(30000)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-stone pt-4 mb-6">
            <span>Tổng cộng</span>
            <span>{formatCurrency(totalPrice >= 500000 ? totalPrice : totalPrice + 30000)}</span>
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
