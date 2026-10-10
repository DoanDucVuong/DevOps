import { useEffect, useState } from 'react'
import { Package } from 'lucide-react'
import { statusLabels, statusStyles, paymentLabels } from '../../data/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import { fetchMyOrders, IS_BACKEND } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useOrderStore } from '../../store/orderStore'
import EmptyState from '../../components/common/EmptyState'

export default function Orders() {
  const user = useAuthStore((s) => s.user)
  const localOrders = useOrderStore((s) => s.orders)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(IS_BACKEND)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!IS_BACKEND) {
      setOrders(localOrders.filter((o) => o.userId === user?.email))
      return
    }
    setLoading(true)
    fetchMyOrders()
      .then(setOrders)
      .catch(() => setError('Không tải được lịch sử đơn hàng. Vui lòng thử lại sau.'))
      .finally(() => setLoading(false))
  }, [localOrders, user?.email])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 space-y-5">
        {[0, 1].map((i) => <div key={i} className="h-40 bg-stone rounded-sm animate-pulse" />)}
      </div>
    )
  }

  if (error) {
    return <p className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center text-sm text-clay">{error}</p>
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <EmptyState
          icon={Package}
          title="Chưa có đơn hàng nào"
          description="Đơn hàng của bạn sẽ hiển thị tại đây sau khi đặt hàng thành công."
          actionLabel="Mua sắm ngay"
          actionTo="/products"
        />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
      <h1 className="font-display text-3xl mb-8">Lịch sử đơn hàng</h1>

      <div className="space-y-5">
        {orders.map((order) => (
          <div key={order.id} className="border border-stone rounded-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-4 border-b border-stone">
              <div>
                <p className="font-medium text-sm">Mã đơn hàng: {order.id}</p>
                <p className="text-xs text-ink-soft mt-0.5">
                  Ngày đặt: {formatDate(order.date)}
                  {order.paymentMethod && ` · ${paymentLabels[order.paymentMethod]}`}
                </p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusStyles[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className="flex justify-between text-sm gap-4">
                  <span>
                    {item.name} <span className="text-ink-soft">x{item.quantity}</span>
                  </span>
                  <span className="shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm font-semibold pt-3 border-t border-stone">
              <span>Tổng tiền</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
