import { useCallback, useEffect, useRef, useState } from 'react'
import { RefreshCw, Brain } from 'lucide-react'
import {
  fetchAdminDashboard, fetchAdminOrders, updateOrderStatus, fetchMlStatus, triggerRetrain,
} from '../../api/client'
import { statusLabels, paymentLabels } from '../../data/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import { useToast } from '../../components/common/Toast'

const ALGO_LABELS = {
  hybrid: 'Hybrid',
  popularity: 'Popularity',
  content_based: 'Content-based',
  fallback_top_rated: 'Dự phòng (top đánh giá)',
}

function StatCard({ label, value, hint }) {
  return (
    <div className="border border-stone rounded-sm p-5 bg-paper">
      <p className="text-xs text-ink-soft mb-2">{label}</p>
      <p className="font-display text-2xl">{value}</p>
      {hint && <p className="text-xs text-ink-soft mt-1">{hint}</p>}
    </div>
  )
}

function Panel({ title, action, children }) {
  return (
    <section className="border border-stone rounded-sm p-5 bg-paper">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="font-display text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Admin() {
  const { showToast } = useToast()
  const [dash, setDash] = useState(null)
  const [orders, setOrders] = useState([])
  const [ml, setMl] = useState(null)
  const [mlError, setMlError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const loadAll = useCallback(async () => {
    try {
      const [d, o] = await Promise.all([fetchAdminDashboard(), fetchAdminOrders()])
      setDash(d)
      setOrders(o)
      setError('')
    } catch (err) {
      setError(err.response?.status === 403 ? 'Tài khoản không có quyền quản trị.' : 'Không tải được dữ liệu từ Backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMl = useCallback(async () => {
    try {
      const s = await fetchMlStatus()
      setMl(s)
      setMlError('')
      return s
    } catch {
      setMlError('Không kết nối được ML service (có thể đang khởi động, thử lại sau ít phút).')
      return null
    }
  }, [])

  useEffect(() => {
    loadAll()
    loadMl()
    return () => clearInterval(pollRef.current)
  }, [loadAll, loadMl])

  const handleRetrain = async () => {
    try {
      await triggerRetrain()
      showToast('Đã bắt đầu huấn luyện lại từ dữ liệu thật')
      clearInterval(pollRef.current)
      let ticks = 0
      pollRef.current = setInterval(async () => {
        ticks += 1
        const s = await loadMl()
        if ((s && !s.training.running) || ticks > 60) {
          clearInterval(pollRef.current)
          if (s?.training.error) showToast('Huấn luyện thất bại: ' + s.training.error)
          else if (s) { showToast('Huấn luyện xong, mô hình đã được cập nhật'); loadAll() }
        }
      }, 2000)
      loadMl()
    } catch (err) {
      showToast(err.response?.status === 409 ? 'Đang huấn luyện, vui lòng đợi' : 'Không thể bắt đầu huấn luyện')
    }
  }

  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.numericId, status)
      setOrders((list) => list.map((o) => (o.numericId === order.numericId ? { ...o, status } : o)))
      showToast(`Đơn ${order.id}: ${statusLabels[status]}`)
      fetchAdminDashboard().then(setDash).catch(() => {})
    } catch {
      showToast('Cập nhật trạng thái thất bại')
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 md:px-6 py-10"><div className="h-64 bg-stone rounded-sm animate-pulse" /></div>
  }
  if (error) {
    return <p className="max-w-7xl mx-auto px-4 py-24 text-center text-sm text-clay">{error}</p>
  }

  const maxRevenue = Math.max(...dash.revenueByDay.map((d) => d.revenue), 1)
  const summary = ml?.training_summary || {}
  const metrics = ml?.collaborative_metrics || {}
  const running = ml?.training?.running

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Bảng điều khiển</h1>
        <button onClick={() => { loadAll(); loadMl() }} className="flex items-center gap-2 text-sm text-ink-soft hover:text-clay">
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Doanh thu (không tính đơn huỷ)" value={formatCurrency(dash.revenue)} />
        <StatCard label="Đơn hàng" value={dash.orderCount} />
        <StatCard label="Khách hàng" value={dash.userCount} hint={`${dash.interactionCount} lượt tương tác`} />
        <StatCard
          label="CTR gợi ý"
          value={`${dash.recommendation.ctr}%`}
          hint={`${dash.recommendation.clicks} click / ${dash.recommendation.impressions} lượt hiển thị`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Doanh thu 7 ngày gần nhất">
          <div className="flex items-end gap-2 h-44">
            {dash.revenueByDay.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${formatCurrency(d.revenue)} · ${d.orders} đơn`}>
                <div
                  className="w-full bg-clay/80 rounded-t-sm min-h-[2px]"
                  style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                />
                <span className="text-[11px] text-ink-soft mt-2">{d.date.slice(8)}/{d.date.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="CTR theo thuật toán gợi ý">
          {dash.recommendation.byAlgorithm.length === 0 ? (
            <p className="text-sm text-ink-soft">Chưa có lượt hiển thị gợi ý nào.</p>
          ) : (
            <div className="space-y-4">
              {dash.recommendation.byAlgorithm.map((a) => (
                <div key={a.algorithm}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span>{ALGO_LABELS[a.algorithm] || a.algorithm}</span>
                    <span className="text-ink-soft">{a.ctr}% · {a.clicks}/{a.impressions}</span>
                  </div>
                  <div className="h-2 bg-stone rounded-full overflow-hidden">
                    <div className="h-full bg-moss" style={{ width: `${Math.min(a.ctr * 4, 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-ink-soft">Thanh hiển thị theo thang 0–25% để dễ so sánh.</p>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="Sản phẩm được quan tâm nhiều nhất">
          {dash.topProducts.length === 0 ? (
            <p className="text-sm text-ink-soft">Chưa có dữ liệu tương tác.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {dash.topProducts.map((p, i) => (
                <li key={p.id} className="flex justify-between gap-4">
                  <span>{i + 1}. {p.name}</span>
                  <span className="text-ink-soft shrink-0">{p.interactions} lượt</span>
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-wrap gap-2 mt-5">
            {dash.ordersByStatus.map((s) => (
              <span key={s.status} className="text-xs border border-stone-dark rounded-full px-3 py-1">
                {statusLabels[s.status]}: {s.count}
              </span>
            ))}
          </div>
        </Panel>

        <Panel
          title="Mô hình Machine Learning"
          action={
            <button
              onClick={handleRetrain}
              disabled={running}
              className="flex items-center gap-2 text-sm px-3 py-1.5 bg-ink text-ivory rounded-sm hover:bg-ink-soft disabled:opacity-60"
            >
              <Brain size={15} /> {running ? 'Đang huấn luyện...' : 'Huấn luyện lại'}
            </button>
          }
        >
          {mlError ? (
            <p className="text-sm text-clay">{mlError}</p>
          ) : !ml ? (
            <p className="text-sm text-ink-soft">Đang tải...</p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-ink-soft">Nguồn dữ liệu</dt>
              <dd>{summary.source || '—'}</dd>
              <dt className="text-ink-soft">Tương tác thật</dt>
              <dd>{summary.n_real ?? '—'} ({summary.n_real_users ?? 0} người dùng)</dd>
              <dt className="text-ink-soft">Dữ liệu giả lập (nền)</dt>
              <dd>{summary.n_synthetic ?? '—'}</dd>
              <dt className="text-ink-soft">RMSE / MAE (5-fold)</dt>
              <dd>{metrics.rmse_cv_mean?.toFixed(3)} / {metrics.mae_cv_mean?.toFixed(3)}</dd>
              <dt className="text-ink-soft">Huấn luyện lúc</dt>
              <dd>{summary.trained_at ? new Date(summary.trained_at).toLocaleString('vi-VN') : '—'}</dd>
            </dl>
          )}
        </Panel>
      </div>

      <Panel title={`Đơn hàng (${orders.length})`}>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-soft">Chưa có đơn hàng nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-ink-soft border-b border-stone">
                  <th className="py-2 pr-3 font-medium">Mã</th>
                  <th className="py-2 pr-3 font-medium">Khách hàng</th>
                  <th className="py-2 pr-3 font-medium">Ngày đặt</th>
                  <th className="py-2 pr-3 font-medium">Thanh toán</th>
                  <th className="py-2 pr-3 font-medium text-right">Tổng tiền</th>
                  <th className="py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-stone last:border-0">
                    <td className="py-3 pr-3 font-medium">{o.id}</td>
                    <td className="py-3 pr-3">
                      {o.customerName || '—'}
                      <span className="block text-xs text-ink-soft">{o.customerEmail}</span>
                    </td>
                    <td className="py-3 pr-3">{formatDate(o.date)}</td>
                    <td className="py-3 pr-3">{paymentLabels[o.paymentMethod] || '—'}</td>
                    <td className="py-3 pr-3 text-right">{formatCurrency(o.total)}</td>
                    <td className="py-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o, e.target.value)}
                        className="border border-stone-dark rounded-sm px-2 py-1 bg-paper text-sm"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
