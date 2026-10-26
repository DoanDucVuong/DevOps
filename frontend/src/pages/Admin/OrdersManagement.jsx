import { useState, useEffect, useCallback } from 'react'
import {
  Package,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  ChevronDown,
  AlertCircle,
  Calendar,
  User,
  Mail,
  MapPin,
  Phone,
  Tag,
  Loader2,
} from 'lucide-react'
import { fetchAdminOrders, updateOrderStatus } from '../../api/client'
import { formatCurrency, formatDate } from '../../utils/format'
import { useToast } from '../../components/common/Toast'

// Status Badge Configuration đồng bộ 100% với giao diện người dùng
export const STATUS_CONFIG = {
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

const PAYMENT_LABELS = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank: 'Chuyển khoản ngân hàng',
  wallet: 'Ví điện tử',
}

export default function OrdersManagement() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchAdminOrders()
      setOrders(data || [])
    } catch (err) {
      console.error('[OrdersManagement] Lỗi nạp đơn hàng:', err)
      setError(
        err.response?.status === 403
          ? 'Tài khoản không có quyền quản trị.'
          : 'Không thể tải danh sách đơn hàng từ hệ thống.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Xử lý cập nhật trạng thái đơn hàng (BẮT BUỘC TUÂN THỦ: No Optimistic UI)
  const handleStatusChange = async (order, newStatus) => {
    if (order.status === newStatus) return
    const orderIdToUpdate = order.numericId || order.id

    setUpdatingId(orderIdToUpdate)
    try {
      // Bắt buộc await API trả về 200 OK trước khi cập nhật state UI
      const res = await updateOrderStatus(orderIdToUpdate, newStatus)
      if (res && (res.id || res.status)) {
        setOrders((prev) =>
          prev.map((o) =>
            (o.numericId || o.id) === orderIdToUpdate ? { ...o, status: newStatus } : o
          )
        )
        if (selectedOrder && (selectedOrder.numericId || selectedOrder.id) === orderIdToUpdate) {
          setSelectedOrder((prev) => ({ ...prev, status: newStatus }))
        }
        showToast(
          `Cập nhật đơn hàng ${order.id} sang "${STATUS_CONFIG[newStatus]?.label || newStatus}" thành công!`
        )
      } else {
        throw new Error('Phản hồi máy chủ không hợp lệ')
      }
    } catch (err) {
      console.error('[OrdersManagement] Lỗi cập nhật trạng thái:', err)
      showToast(err.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Lọc và tìm kiếm đơn hàng
  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      o.id?.toLowerCase().includes(term) ||
      o.customerName?.toLowerCase().includes(term) ||
      o.customerEmail?.toLowerCase().includes(term) ||
      o.shipping?.name?.toLowerCase().includes(term) ||
      o.shipping?.phone?.includes(term)
    return matchStatus && matchSearch
  })

  // Đếm đơn theo trạng thái
  const countByStatus = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone">
        <div>
          <h2 className="font-display text-2xl text-ink">Quản lý Đơn hàng</h2>
          <p className="text-xs text-ink-soft mt-1">
            Theo dõi, xử lý và cập nhật tiến độ giao nhận đơn hàng toàn hệ thống
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-ink-soft hover:text-clay self-start sm:self-auto bg-paper px-3 py-1.5 border border-stone rounded-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex border-b border-stone gap-2 overflow-x-auto text-xs md:text-sm font-medium pb-px">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Đang xử lý' },
          { key: 'paid', label: 'Đã thanh toán' },
          { key: 'shipped', label: 'Đang giao' },
          { key: 'completed', label: 'Hoàn thành' },
          { key: 'cancelled', label: 'Đã hủy' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? 'border-clay text-clay font-semibold'
                : 'border-transparent text-ink-soft hover:text-ink hover:border-stone-dark'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                statusFilter === tab.key
                  ? 'bg-clay text-ivory'
                  : 'bg-stone text-ink-soft'
              }`}
            >
              {countByStatus[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-3.5 bg-stone-light/40 border border-stone rounded-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-ink-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng, email, số điện thoại..."
            className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-paper border border-stone-dark rounded-sm outline-none focus:border-ink"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-xs text-clay hover:underline flex items-center gap-1 self-center"
          >
            <X size={14} /> Xóa tìm kiếm
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-sm flex items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <p>{error}</p>
        </div>
      )}

      {/* Orders Table Panel */}
      <div className="border border-stone rounded-sm bg-paper shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 size={24} className="animate-spin text-clay mx-auto" />
            <p className="text-xs text-ink-soft">Đang nạp danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package size={36} className="mx-auto text-ink-soft/40 stroke-1" />
            <p className="text-sm font-medium text-ink">Không có đơn hàng nào</p>
            <p className="text-xs text-ink-soft">
              {search || statusFilter !== 'all'
                ? 'Không tìm thấy đơn hàng phù hợp với điều kiện lọc hiện tại.'
                : 'Chưa có đơn hàng nào được tạo trên hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-stone-light/60 border-b border-stone text-ink-soft font-medium">
                  <th className="py-3 px-4">Mã đơn</th>
                  <th className="py-3 px-4">Khách hàng</th>
                  <th className="py-3 px-4">Ngày đặt</th>
                  <th className="py-3 px-4">Sản phẩm</th>
                  <th className="py-3 px-4">Thanh toán</th>
                  <th className="py-3 px-4 text-right">Tổng tiền</th>
                  <th className="py-3 px-4 text-center">Trạng thái (Badge & Cập nhật)</th>
                  <th className="py-3 px-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone">
                {filteredOrders.map((order) => {
                  const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                  const StatusIcon = statusInfo.icon
                  const isUpdating = updatingId === (order.numericId || order.id)

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-light/20 transition-colors"
                    >
                      {/* Mã đơn */}
                      <td className="py-3 px-4 font-mono font-medium text-ink whitespace-nowrap">
                        {order.id}
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-ink">
                          {order.customerName || order.shipping?.name || 'Khách vãng lai'}
                        </div>
                        <div className="text-[11px] text-ink-soft">
                          {order.customerEmail || order.shipping?.email || '—'}
                        </div>
                        {order.shipping?.phone && (
                          <div className="text-[11px] text-ink-soft">
                            SĐT: {order.shipping.phone}
                          </div>
                        )}
                      </td>

                      {/* Ngày đặt */}
                      <td className="py-3 px-4 whitespace-nowrap text-ink-soft">
                        {formatDate(order.date)}
                      </td>

                      {/* Sản phẩm tóm tắt */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <span className="text-xs text-ink block line-clamp-1">
                          {order.items && order.items.length > 0
                            ? order.items.map((it) => `${it.name || it.product_name} (x${it.quantity})`).join(', ')
                            : 'Không có chi tiết'}
                        </span>
                        <span className="text-[11px] text-ink-soft">
                          {order.items?.length || 0} sản phẩm
                        </span>
                      </td>

                      {/* Thanh toán */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-ink-soft">
                        {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod || 'COD'}
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3 px-4 text-right font-display font-medium text-ink whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </td>

                      {/* Cột Trạng thái: Dropdown select & Badge màu đồng bộ */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center gap-1.5">
                          {/* Badge màu sắc chuẩn với User UI */}
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.badgeClass}`}
                          >
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>

                          {/* Thẻ select cập nhật trạng thái */}
                          <div className="relative">
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(order, e.target.value)}
                              className="text-xs border border-stone-dark rounded-sm px-2.5 py-1 bg-paper text-ink outline-none focus:border-ink hover:border-ink transition-colors cursor-pointer disabled:opacity-50 pr-7 appearance-none"
                            >
                              <option value="pending">Đang xử lý</option>
                              <option value="paid">Đã thanh toán</option>
                              <option value="shipped">Đang giao hàng</option>
                              <option value="completed">Hoàn thành</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                            {isUpdating ? (
                              <Loader2
                                size={12}
                                className="absolute right-2 top-2 animate-spin text-ink-soft pointer-events-none"
                              />
                            ) : (
                              <ChevronDown
                                size={12}
                                className="absolute right-2 top-2 text-ink-soft pointer-events-none"
                              />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Nút Xem chi tiết */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1 text-xs text-clay hover:underline font-medium p-1.5 hover:bg-stone-light/50 rounded-sm transition-colors"
                          title="Xem chi tiết đơn hàng"
                        >
                          <Eye size={15} />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs">
          <div className="bg-paper border border-stone rounded-sm max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <div>
                <h3 className="font-display text-lg text-ink">
                  Chi tiết đơn hàng {selectedOrder.id}
                </h3>
                <p className="text-xs text-ink-soft">
                  Đặt ngày {formatDate(selectedOrder.date)}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-ink-soft hover:text-ink p-1 rounded-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Trạng thái hiện tại trong modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-stone-light/40 border border-stone rounded-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">Trạng thái:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    STATUS_CONFIG[selectedOrder.status]?.badgeClass || STATUS_CONFIG.pending.badgeClass
                  }`}
                >
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-ink-soft">Đổi sang:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder, e.target.value)}
                  className="text-xs border border-stone-dark rounded-sm px-2 py-1 bg-paper text-ink outline-none focus:border-ink cursor-pointer"
                >
                  <option value="pending">Đang xử lý</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="shipped">Đang giao hàng</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
            </div>

            {/* Thông tin người nhận */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 border border-stone rounded-sm space-y-1.5 bg-paper">
                <p className="font-medium text-ink flex items-center gap-1.5">
                  <User size={14} className="text-clay" /> Thông tin khách hàng
                </p>
                <p className="text-ink">
                  Họ tên: {selectedOrder.customerName || selectedOrder.shipping?.name || '—'}
                </p>
                <p className="text-ink-soft">
                  Email: {selectedOrder.customerEmail || selectedOrder.shipping?.email || '—'}
                </p>
                <p className="text-ink-soft">
                  SĐT: {selectedOrder.shipping?.phone || '—'}
                </p>
              </div>

              <div className="p-3.5 border border-stone rounded-sm space-y-1.5 bg-paper">
                <p className="font-medium text-ink flex items-center gap-1.5">
                  <MapPin size={14} className="text-clay" /> Địa chỉ giao hàng
                </p>
                <p className="text-ink leading-relaxed">
                  {selectedOrder.shipping?.address || 'Chưa cung cấp địa chỉ'}
                </p>
                {selectedOrder.shipping?.note && (
                  <p className="text-[11px] text-clay italic">
                    Ghi chú: {selectedOrder.shipping.note}
                  </p>
                )}
                <p className="text-ink-soft pt-1">
                  Thanh toán:{' '}
                  {PAYMENT_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod || 'COD'}
                </p>
              </div>
            </div>

            {/* Danh sách sản phẩm đặt mua */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-ink uppercase tracking-wider">
                Sản phẩm trong đơn
              </p>
              <div className="border border-stone rounded-sm divide-y divide-stone overflow-hidden">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-sm bg-stone-light shrink-0 flex items-center justify-center overflow-hidden border border-stone">
                          {item.image || item.image_url ? (
                            <img
                              src={item.image || item.image_url}
                              alt={item.name || item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ShoppingBag size={16} className="text-ink-soft" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-ink line-clamp-1">
                            {item.name || item.product_name}
                          </p>
                          <p className="text-ink-soft text-[11px]">
                            Đơn giá: {formatCurrency(item.price)} · Số lượng: x{item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-ink shrink-0">
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-xs text-ink-soft text-center">
                    Không có thông tin chi tiết từng sản phẩm.
                  </p>
                )}
              </div>
            </div>

            {/* Tổng kết tiền */}
            <div className="pt-2 border-t border-stone flex justify-between items-center text-sm">
              <span className="font-medium text-ink">Tổng giá trị thanh toán:</span>
              <span className="font-display text-xl text-clay font-bold">
                {formatCurrency(selectedOrder.total)}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-xs font-medium bg-stone hover:bg-stone-dark text-ink rounded-sm transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
