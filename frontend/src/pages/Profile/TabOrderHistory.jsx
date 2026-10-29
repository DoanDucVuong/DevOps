import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Package,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xác nhận' },
  { id: 'paid', label: 'Chờ lấy hàng' },
  { id: 'shipped', label: 'Đang giao' },
  { id: 'completed', label: 'Hoàn thành' },
  { id: 'cancelled', label: 'Đã hủy' },
]

const STATUS_BADGES = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800',
    icon: Clock,
  },
  paid: {
    label: 'Chờ lấy hàng',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-400 dark:border-sky-800',
    icon: CreditCard,
  },
  shipped: {
    label: 'Đang giao',
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800',
    icon: Truck,
  },
  completed: {
    label: 'Hoàn thành',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800',
    icon: XCircle,
  },
}

export default function TabOrderHistory({ orders = [], loading = false }) {
  const [activeStatus, setActiveStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Lọc đơn hàng theo tab trạng thái và từ khóa tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Lọc theo trạng thái
      if (activeStatus !== 'all' && order.status !== activeStatus) {
        return false
      }

      // 2. Lọc theo tìm kiếm (Mã đơn hoặc Tên sản phẩm)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const orderIdStr = String(order.id || order.code || '').toLowerCase()
        const items = parseItems(order)
        const matchItem = items.some((it) =>
          String(it.name || '').toLowerCase().includes(q)
        )
        return orderIdStr.includes(q) || matchItem
      }

      return true
    })
  }, [orders, activeStatus, searchQuery])

  return (
    <div className="space-y-4">
      {/* 1. THANH TÌM KIẾM BO GÓC TRÒN VỚI KÍNH LÚP (SEARCH BAR) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
        <div className="relative flex items-center">
          <Search
            size={18}
            className="absolute left-3.5 text-stone-400 dark:text-stone-500 shrink-0 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo Mã đơn hàng hoặc Tên sản phẩm..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/80 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 outline-none focus:border-yellow-400 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* 2. DẢI TABS TRẠNG THÁI: DÀN NGANG CÓ THỂ CUỘN, TAB ACTIVE CÓ VIỀN DƯỚI BORDER-YELLOW-400 */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 px-4 pt-1 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 min-w-max border-b border-stone-100 dark:border-slate-800">
          {STATUS_TABS.map((tab) => {
            const isActive = activeStatus === tab.id
            const count =
              tab.id === 'all'
                ? orders.length
                : orders.filter((o) => o.status === tab.id).length

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`py-3 text-sm transition-all relative select-none ${
                  isActive
                    ? 'border-b-2 border-yellow-400 text-yellow-600 dark:text-yellow-400 font-medium'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 border-b-2 border-transparent'
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[11px] ${
                      isActive
                        ? 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-700 dark:text-yellow-300 font-bold'
                        : 'bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-stone-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. DANH SÁCH ĐƠN HÀNG HOẶC EMPTY STATE */}
      {loading ? (
        <div className="p-8 text-center text-sm text-stone-400">
          Đang tải dữ liệu đơn hàng...
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State: Khối nền trắng, icon hộp giấy màu xám nhạt tròn, dòng chữ "Bạn chưa có đơn hàng nào" */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-12 text-center shadow-xs">
          <div className="h-20 w-20 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-stone-500 flex items-center justify-center mx-auto mb-4">
            <Package size={36} />
          </div>
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
            Bạn chưa có đơn hàng nào
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-6">
            Mọi thông tin đơn đặt hàng và trạng thái cập nhật vận chuyển sẽ được hiển thị chi tiết tại đây.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold transition-all shadow-xs"
          >
            <ShoppingBag size={14} />
            <span>Khám phá sản phẩm ngay</span>
          </Link>
        </div>
      ) : (
        /* Danh sách đơn hàng */
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const items = parseItems(order)
            const badge =
              STATUS_BADGES[order.status] || STATUS_BADGES.pending
            const StatusIcon = badge.icon
            const orderCode =
              order.code || `DH${String(order.id || 0).padStart(6, '0')}`

            return (
              <div
                key={order.id || orderCode}
                className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs transition-all hover:border-stone-300 dark:hover:border-slate-700"
              >
                {/* Header đơn */}
                <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-slate-800 gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-stone-900 dark:text-white">
                      #{orderCode}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar size={13} />
                      {order.date || order.createdAt
                        ? formatDate(order.date || order.createdAt)
                        : 'Vừa xong'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}
                  >
                    <StatusIcon size={13} />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-100 dark:divide-slate-800/60 mb-4">
                  {items.map((item, idx) => {
                    const imgUrl = item.image || item.image_url
                    return (
                      <div
                        key={idx}
                        className="py-2.5 flex items-center justify-between gap-3 text-sm"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="h-12 w-12 rounded-lg object-cover border border-stone-100 dark:border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-stone-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              <Package size={18} className="text-stone-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-900 dark:text-white truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-stone-400">
                              SL: x{item.quantity || 1}{' '}
                              {item.size ? `• Size: ${item.size}` : ''}
                            </p>
                          </div>
                        </div>

                        <span className="font-medium text-stone-900 dark:text-stone-100 shrink-0">
                          {formatCurrency(Number(item.price || 0))}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Footer đơn: Tổng tiền & Xem chi tiết */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    Tổng thanh toán:{' '}
                    <span className="text-base font-bold text-stone-900 dark:text-white ml-1">
                      {formatCurrency(Number(order.total || 0))}
                    </span>
                  </div>

                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:border-yellow-400 hover:text-yellow-600 transition-colors"
                  >
                    <span>Xem chi tiết</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
