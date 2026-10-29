import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Tag,
  Calendar,
  MapPin,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { api } from '../../api/client'
import { formatCurrency, formatDate } from '../../utils/format'

// Status Badge Configuration
const STATUS_CONFIG = {
  pending: {
    label: 'Đang xử lý',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  paid: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: CreditCard,
  },
  shipped: {
    label: 'Đang giao hàng',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
  },
}

// Payment Methods Configuration
const PAYMENT_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  vnpay: 'Cổng VNPAY (ATM/QR/Visa)',
  bank: 'Chuyển khoản VietQR',
  vietqr: 'Chuyển khoản VietQR (Timo Bank)',
  wallet: 'Ví điện tử',
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    api
      .get('/orders/me')
      .then((res) => {
        if (!isMounted) return
        const data = Array.isArray(res.data) ? res.data : []
        setOrders(data)
      })
      .catch((err) => {
        if (!isMounted) return
        console.error('[OrderHistory] Lỗi tải đơn hàng:', err)
        setError('Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Helper để lấy danh sách items an toàn (hỗ trợ cả JSON string và array)
  const parseItems = (order) => {
    if (!order) return []
    if (Array.isArray(order.items)) return order.items
    if (typeof order.items_json === 'string') {
      try {
        const parsed = JSON.parse(order.items_json)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return []
      }
    }
    return []
  }

  // Helper để lấy thông tin shipping an toàn
  const parseShipping = (order) => {
    if (!order) return null
    if (typeof order.shipping === 'object' && order.shipping !== null) return order.shipping
    if (typeof order.shipping_json === 'string') {
      try {
        return JSON.parse(order.shipping_json)
      } catch (e) {
        return null
      }
    }
    return null
  }

  // Loading Skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="h-8 w-60 bg-stone/50 rounded-sm animate-pulse mb-8" />
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="border border-stone rounded-sm p-6 space-y-4 animate-pulse bg-paper/60">
              <div className="flex justify-between items-center pb-4 border-b border-stone">
                <div className="h-5 w-36 bg-stone/60 rounded" />
                <div className="h-6 w-24 bg-stone/60 rounded-full" />
              </div>
              <div className="h-16 bg-stone/40 rounded" />
              <div className="h-8 w-48 bg-stone/50 rounded ml-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <XCircle size={28} />
        </div>
        <h2 className="font-display text-xl text-ink mb-2">Đã xảy ra sự cố</h2>
        <p className="text-sm text-ink-soft mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-ink text-ivory text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-ink-soft transition-colors"
        >
          Tải lại trang
        </button>
      </div>
    )
  }

  // Empty State: Bạn chưa có đơn hàng nào
  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="h-20 w-20 rounded-full bg-stone/40 text-ink-soft flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={34} className="text-clay/80" />
        </div>
        <h2 className="font-display text-2xl text-ink mb-2">Bạn chưa có đơn hàng nào</h2>
        <p className="text-sm text-ink-soft max-w-md mx-auto mb-8">
          Khi bạn đặt hàng, toàn bộ thông tin chi tiết đơn hàng và trạng thái vận chuyển sẽ xuất hiện tại đây.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-ivory text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-ink-soft transition-all shadow-sm"
        >
          <Sparkles size={16} /> Tiếp tục mua sắm
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-soft mb-1">
            <Link to="/profile" className="hover:text-ink flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} /> Tài khoản
            </Link>
            <span>/</span>
            <span className="text-ink font-medium">Lịch sử đơn hàng</span>
          </div>
          <h1 className="font-display text-3xl text-ink flex items-center gap-2.5">
            <Package className="text-clay" size={28} />
            Đơn hàng của bạn ({orders.length})
          </h1>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-clay hover:text-ink transition-colors"
        >
          Khám phá thêm <ChevronRight size={14} />
        </Link>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const orderCode = order.code || (order.id ? `DH${String(order.id).padStart(6, '0')}` : 'Đơn hàng')
          const statusKey = order.status || 'pending'
          const statusMeta = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending
          const StatusIcon = statusMeta.icon
          const itemsList = parseItems(order)
          const shippingInfo = parseShipping(order)
          const orderDate = order.createdAt || order.date || order.created_at
          const paymentText = PAYMENT_LABELS[order.paymentMethod || order.payment_method] || 'Thanh toán COD'
          const voucher = shippingInfo?.voucher

          return (
            <div
              key={order.id || orderCode}
              className="bg-paper border border-stone-dark/30 rounded-sm shadow-xs overflow-hidden transition-all hover:border-stone-dark/60"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 bg-stone/15 border-b border-stone flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-bold text-ink tracking-wide">
                      {orderCode}
                    </span>
                    <span className="text-xs text-stone-dark">|</span>
                    <span className="text-xs text-ink-soft flex items-center gap-1">
                      <Calendar size={13} />
                      {orderDate ? formatDate(orderDate) : 'Vừa xong'}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft flex items-center gap-1.5">
                    <CreditCard size={12} className="text-stone-dark" />
                    <span>{paymentText}</span>
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.badgeClass}`}
                >
                  <StatusIcon size={14} />
                  <span>{statusMeta.label}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 sm:p-5 divide-y divide-stone/40">
                {itemsList.map((item, idx) => {
                  const itemImg = item.image || item.image_url
                  const itemPrice = Number(item.price || 0)
                  const itemQty = Number(item.quantity || 1)

                  return (
                    <div key={`${item.productId || idx}-${idx}`} className="py-3.5 first:pt-0 last:pb-0 flex gap-4">
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.name || 'Sản phẩm'}
                          className="h-16 w-14 object-cover rounded-sm bg-stone shrink-0 border border-stone-dark/20"
                        />
                      ) : (
                        <div className="h-16 w-14 rounded-sm bg-stone/40 flex items-center justify-center shrink-0 border border-stone-dark/20 text-ink-soft text-xs">
                          <Package size={18} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-ink truncate mb-0.5">
                            {item.name || 'Sản phẩm thời trang Maison'}
                          </h4>
                          <p className="text-xs text-ink-soft">
                            {item.color && <span>Màu: {item.color} </span>}
                            {item.size && <span>| Size: {item.size} </span>}
                            <span className="font-semibold text-ink ml-1">x{itemQty}</span>
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-ink">
                          {formatCurrency(itemPrice * itemQty)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Shipping info & Voucher details */}
              {shippingInfo && (
                <div className="px-4 sm:px-5 py-3 bg-stone/10 border-t border-stone/50 text-xs text-ink-soft flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-clay shrink-0" />
                    <span>
                      Giao tới: <strong className="text-ink font-medium">{shippingInfo.fullName}</strong> ({shippingInfo.phone}) — {shippingInfo.address}, {shippingInfo.city}
                    </span>
                  </div>

                  {voucher && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-moss/10 text-moss border border-moss/20 rounded-sm font-medium">
                      <Tag size={12} />
                      <span>
                        Mã {voucher.code} (-{formatCurrency(voucher.discount)})
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer: Total Breakdown */}
              <div className="p-4 sm:p-5 bg-stone/5 border-t border-stone flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-ink-soft">
                  {order.shippingFee !== undefined && (
                    <span>
                      Phí ship: {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-ink-soft uppercase tracking-wider font-semibold">
                    Tổng thanh toán:
                  </span>
                  <span className="font-display text-xl font-bold text-ink">
                    {formatCurrency(order.total || order.total_amount || 0)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
