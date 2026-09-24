import { Package } from 'lucide-react'
import { sampleOrders, statusLabels } from '../../data/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import EmptyState from '../../components/common/EmptyState'

const STATUS_STYLES = {
  pending: 'bg-gold/15 text-gold',
  shipping: 'bg-clay/10 text-clay',
  delivered: 'bg-moss/10 text-moss',
  cancelled: 'bg-stone text-ink-soft',
}

export default function Orders() {
  const orders = sampleOrders

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
                <p className="text-xs text-ink-soft mt-0.5">Ngày đặt: {formatDate(order.date)}</p>
              </div>
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[order.status]}`}>
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>
                    {item.name} <span className="text-ink-soft">x{item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
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
