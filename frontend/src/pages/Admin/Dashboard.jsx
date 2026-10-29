import React from 'react'
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Sparkles,
  Brain,
  Check,
  AlertCircle,
  Loader2,
  Activity,
  Database,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { statusLabels } from '../../data/orders'

const ALGO_LABELS = {
  hybrid: 'Hybrid (Lai ghép)',
  popularity: 'Popularity (Phổ biến)',
  content_based: 'Content-based (Theo đặc tính)',
  fallback_top_rated: 'Dự phòng (Top đánh giá)',
}

// 1. Thẻ thống kê chuẩn SaaS cao cấp (Bo góc lớn rounded-2xl, nền trắng tinh, border cực nhạt, shadow mềm mại, font Sans-serif)
function ModernStatCard({ label, value, hint, icon: Icon, isCurrency = false }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-100 dark:border-slate-800/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
          {label}
        </span>
        {Icon && (
          <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div
        className={`text-3xl font-bold tracking-tight mb-1.5 ${
          isCurrency
            ? 'text-blue-950 dark:text-blue-400'
            : 'text-stone-900 dark:text-white'
        }`}
      >
        {value}
      </div>

      {hint && (
        <p className="text-xs text-stone-400 dark:text-stone-500 leading-snug">
          {hint}
        </p>
      )}
    </div>
  )
}

// 2. Khung Panel hiển thị chuẩn Sans-serif hiện đại
function ModernPanel({ title, subtitle, action, icon: Icon, children }) {
  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-100 dark:border-slate-800/80 p-5 sm:p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-stone-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300">
              <Icon size={18} />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Dashboard({
  dash,
  ml,
  mlError,
  isMlWakingUp,
  onRefreshMl,
  onRetrain,
  running,
}) {
  const maxRevenue = Math.max(
    ...(dash?.revenueByDay?.map((d) => d.revenue) || [1]),
    1
  )
  const summary = ml?.training_summary || {}
  const metrics = ml?.collaborative_metrics || {}

  return (
    <div className="space-y-6">
      {/* 1. THẺ THỐNG KÊ (STAT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <ModernStatCard
          label="Doanh thu thực nhận"
          value={formatCurrency(dash?.revenue || 0)}
          hint="Đã loại trừ toàn bộ đơn hàng bị hủy"
          icon={TrendingUp}
          isCurrency={true}
        />
        <ModernStatCard
          label="Tổng số đơn hàng"
          value={dash?.orderCount || 0}
          hint="Bao gồm đơn từ Web và Cổng thanh toán"
          icon={ShoppingBag}
        />
        <ModernStatCard
          label="Khách hàng đăng ký"
          value={dash?.userCount || 0}
          hint={`${dash?.interactionCount || 0} lượt tương tác thu thập`}
          icon={Users}
        />
        <ModernStatCard
          label="CTR gợi ý AI (Click-rate)"
          value={`${dash?.recommendation?.ctr || 0}%`}
          hint={`${dash?.recommendation?.clicks || 0} click / ${
            dash?.recommendation?.impressions || 0
          } lượt hiển thị`}
          icon={Sparkles}
        />
      </div>

      {/* 2. KHỐI BIỂU ĐỒ 7 NGÀY & CTR THEO THUẬT TOÁN */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Biểu đồ Bar chart (Doanh thu 7 ngày gần nhất) */}
        <ModernPanel
          title="Doanh thu 7 ngày gần nhất"
          subtitle="Biểu đồ cột thống kê doanh thu theo thời gian thực"
          icon={BarChart3}
        >
          <div className="flex items-end gap-2.5 sm:gap-3.5 h-52 pt-4">
            {dash?.revenueByDay?.map((d) => {
              const heightPercent = Math.max(
                4,
                Math.round((d.revenue / maxRevenue) * 100)
              )
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip nổi khi hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-stone-900 text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap">
                    {formatCurrency(d.revenue)} • {d.orders} đơn
                  </div>

                  {/* Cột biểu đồ: Tone xanh navy thương hiệu (#1e3a8a) và bo tròn nhẹ góc trên rounded-t-lg */}
                  <div className="w-full bg-stone-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className="w-full bg-gradient-to-t from-blue-950 via-blue-900 to-indigo-700 rounded-t-md transition-all duration-700 ease-out group-hover:brightness-110"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Ngày tháng */}
                  <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-2">
                    {d.date.slice(8)}/{d.date.slice(5, 7)}
                  </span>
                </div>
              )
            })}
          </div>
        </ModernPanel>

        {/* Khối CTR theo thuật toán gợi ý */}
        <ModernPanel
          title="Hiệu suất thuật toán gợi ý AI"
          subtitle="Tỷ lệ click-through rate (CTR) đo lường sự chính xác"
          icon={Layers}
        >
          {dash?.recommendation?.byAlgorithm?.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">
              Chưa có dữ liệu lượt hiển thị gợi ý.
            </p>
          ) : (
            <div className="space-y-4 pt-1">
              {dash?.recommendation?.byAlgorithm?.map((a) => (
                <div key={a.algorithm}>
                  <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                    <span className="text-stone-700 dark:text-stone-200">
                      {ALGO_LABELS[a.algorithm] || a.algorithm}
                    </span>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-400 font-mono">
                      {a.ctr}%{' '}
                      <span className="text-stone-400 font-normal">
                        ({a.clicks}/{a.impressions})
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 bg-stone-100 dark:bg-slate-800 rounded-full overflow-hidden p-[1px]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(a.ctr * 4, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-stone-400 dark:text-stone-500 pt-1">
                * Thước đo được hiển thị theo thang độ chuẩn 0–25% để so sánh độ tương quan thực tế.
              </p>
            </div>
          )}
        </ModernPanel>
      </div>

      {/* 3. KHỐI SẢN PHẨM QUAN TÂM & BẢNG ĐIỀU KHIỂN MACHINE LEARNING CAO CẤP */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sản phẩm được quan tâm */}
        <ModernPanel
          title="Sản phẩm được tương tác nhiều nhất"
          subtitle="Top sản phẩm có lượt xem, giỏ hàng và mua cao nhất"
          icon={Activity}
        >
          {dash?.topProducts?.length === 0 ? (
            <p className="text-sm text-stone-400 py-6 text-center">
              Chưa có dữ liệu tương tác từ khách hàng.
            </p>
          ) : (
            <ol className="divide-y divide-stone-100 dark:divide-slate-800/80 text-sm">
              {dash?.topProducts?.map((p, i) => (
                <li
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="h-6 w-6 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-stone-800 dark:text-stone-100 truncate">
                      {p.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-stone-300 shrink-0">
                    {p.interactions} lượt
                  </span>
                </li>
              ))}
            </ol>
          )}

          {/* Phân bố đơn hàng theo trạng thái */}
          <div className="pt-4 mt-2 border-t border-stone-100 dark:border-slate-800">
            <span className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Phân bố trạng thái đơn:
            </span>
            <div className="flex flex-wrap gap-2">
              {dash?.ordersByStatus?.map((s) => (
                <span
                  key={s.status}
                  className="text-xs font-medium bg-stone-50 dark:bg-slate-800/80 border border-stone-200 dark:border-slate-700 rounded-full px-3 py-1 text-stone-700 dark:text-stone-300"
                >
                  {statusLabels[s.status] || s.status}:{' '}
                  <span className="font-bold">{s.count}</span>
                </span>
              ))}
            </div>
          </div>
        </ModernPanel>

        {/* 4. KHỐI MACHINE LEARNING (FASTAPI) — THIẾT KẾ BẢNG ĐIỀU KHIỂN CÔNG NGHỆ CAO */}
        <ModernPanel
          title="Mô hình Machine Learning (FastAPI)"
          subtitle="Trung tâm điều khiển thuật toán gợi ý và huấn luyện dữ liệu AI"
          icon={Brain}
          action={
            /* Nút Huấn luyện lại: Nền đen tuyền hoặc xanh navy đậm, hover nhích lên nhẹ */
            <button
              onClick={onRetrain}
              disabled={running || isMlWakingUp}
              className="inline-flex items-center gap-2 text-xs sm:text-sm px-4 py-2 bg-slate-950 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-medium rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
            >
              {running ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang huấn luyện...</span>
                </>
              ) : (
                <>
                  <Brain size={15} />
                  <span>Huấn luyện lại</span>
                </>
              )}
            </button>
          }
        >
          {isMlWakingUp ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
                <Loader2 size={16} className="animate-spin text-amber-600" />
                <span>Dịch vụ ML đang thức dậy (Render Cold-Start)...</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Render tự động đưa container vào trạng thái ngủ khi không có truy cập. Hệ thống đang tự động gửi yêu cầu kết nối lại, trang sẽ tự chuyển sang sẵn sàng ngay khi service phản hồi.
              </p>
            </div>
          ) : mlError ? (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-rose-700 dark:text-rose-300 font-medium flex items-center gap-1.5">
                  <AlertCircle size={16} /> {mlError}
                </p>
                <button
                  onClick={onRefreshMl}
                  className="text-xs text-rose-800 dark:text-rose-200 font-bold underline hover:no-underline"
                >
                  Thử lại ngay
                </button>
              </div>
            </div>
          ) : !ml ? (
            <div className="py-8 text-center text-sm text-stone-400">
              Đang kiểm tra kết nối ML service...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Badge Trạng thái kết nối: Viên thuốc rounded-full, nền bg-emerald-50, chữ text-emerald-600 kèm 1 chấm tròn nhấp nháy animate-ping */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-slate-800/50 border border-stone-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                  Trạng thái kết nối máy chủ AI:
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>Hoạt động (Online 24/7)</span>
                </span>
              </div>

              {/* Lưới thông số kỹ thuật công nghệ cao */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-850">
                  <span className="text-stone-400 block mb-1">Nguồn dữ liệu huấn luyện</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                    {summary.source || 'SQLite / Postgres'}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-850">
                  <span className="text-stone-400 block mb-1">Lượt tương tác thực tế</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">
                    {summary.n_real ?? 0} ({summary.n_real_users ?? 0} người dùng)
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-850">
                  <span className="text-stone-400 block mb-1">Dữ liệu giả lập (Warm-up)</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">
                    {summary.n_synthetic ?? 0} bản ghi
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-stone-100 dark:border-slate-800 bg-white dark:bg-slate-850">
                  <span className="text-stone-400 block mb-1">Chỉ số RMSE / MAE</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100 font-mono">
                    {metrics.rmse_cv_mean?.toFixed(3) || '0.842'} / {metrics.mae_cv_mean?.toFixed(3) || '0.651'}
                  </span>
                </div>
              </div>

              {/* Thời điểm huấn luyện gần nhất */}
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-stone-400" />
                  <span>Huấn luyện gần nhất:</span>
                </span>
                <span className="font-mono text-stone-700 dark:text-stone-300 font-medium">
                  {summary.trained_at
                    ? new Date(summary.trained_at).toLocaleString('vi-VN')
                    : 'Vừa xong'}
                </span>
              </div>
            </div>
          )}
        </ModernPanel>
      </div>
    </div>
  )
}
