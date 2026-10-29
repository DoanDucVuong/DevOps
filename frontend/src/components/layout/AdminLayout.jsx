import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Folders,
  Ticket,
  Image as ImageIcon,
  Store,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useToast } from '../common/Toast'

export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan hệ thống', path: '/admin', icon: LayoutDashboard },
  { id: 'orders', label: 'Quản lý đơn hàng', path: '/admin/orders', icon: ShoppingBag },
  { id: 'products', label: 'Quản lý sản phẩm', path: '/admin/products', icon: Package },
  { id: 'categories', label: 'Quản lý danh mục', path: '/admin/categories', icon: Folders },
  { id: 'vouchers', label: 'Mã giảm giá (Vouchers)', path: '/admin/vouchers', icon: Ticket },
  { id: 'banners', label: 'Banner trang chủ', path: '/admin/banners', icon: ImageIcon },
]

export default function AdminLayout({ children }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { theme, toggleTheme } = useThemeStore()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Xác định tab hiện tại từ URL
  const getActiveTab = () => {
    if (location.pathname.includes('/orders')) return 'orders'
    if (location.pathname.includes('/products')) return 'products'
    if (location.pathname.includes('/categories')) return 'categories'
    if (location.pathname.includes('/vouchers')) return 'vouchers'
    if (location.pathname.includes('/banners')) return 'banners'
    return 'dashboard'
  }

  const activeTab = getActiveTab()
  const currentItem = ADMIN_NAV_ITEMS.find((item) => item.id === activeTab) || ADMIN_NAV_ITEMS[0]

  const handleLogout = () => {
    logout()
    showToast('Đã đăng xuất khỏi cổng Quản trị')
    navigate('/login')
  }

  const handleGlobalRefresh = () => {
    setRefreshing(true)
    window.dispatchEvent(new CustomEvent('admin:refresh'))
    setTimeout(() => {
      setRefreshing(false)
      showToast('Đã làm mới toàn bộ dữ liệu quản trị')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-slate-950 text-stone-900 dark:text-stone-100 flex font-sans antialiased">
      {/* ========================================================================= */}
      {/* 1. CỘT SIDEBAR ĐIỀU HƯỚNG BÊN TRÁI (NỀN TỐI SANG TRỌNG bg-slate-900)       */}
      {/* ========================================================================= */}
      {/* Backdrop mobile */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:w-72 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Phần Top Sidebar: Logo & Phân hệ Admin */}
        <div>
          <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <span className="font-sans font-black text-2xl tracking-tight text-white">
                Maison<span className="text-blue-500">.</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <ShieldCheck size={11} /> Admin
              </span>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>

          {/* Danh mục menu điều hướng Sidebar */}
          <div className="p-4 space-y-1">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Quản trị hệ thống
            </p>

            <nav className="space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-500/20 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={isActive ? 'text-blue-400' : 'text-slate-400'}
                      />
                      <span>{item.label}</span>
                    </div>

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Phần Bottom Sidebar: Xem website, User card & Đăng xuất */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store size={15} className="text-amber-400" />
              <span>Xem trang bán hàng</span>
            </div>
            <ChevronRight size={13} className="text-slate-400" />
          </Link>

          {/* User Card */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {user?.fullName || 'Quản trị viên'}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                  {user?.email || 'admin@sttn.vn'}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Đăng xuất khỏi Admin"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. CỘT PHẢI (MAIN CONTENT AREA) VỚI TOP HEADER HIỆN ĐẠI                    */}
      {/* ========================================================================= */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Header: Nền trắng, kính backdrop-blur, Breadcrumb, Nút Refresh, User */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 shadow-2xs px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800"
              aria-label="Mở menu điều hướng"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Sans-serif */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="hidden sm:inline">/</span>
              <span className="font-bold text-stone-900 dark:text-white text-sm">
                {currentItem.label}
              </span>
            </div>
          </div>

          {/* Action buttons Top Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Nút Làm mới dữ liệu viền tinh tế */}
            <button
              onClick={handleGlobalRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-200 hover:border-blue-900 dark:hover:border-blue-400 hover:text-blue-900 dark:hover:text-blue-400 shadow-2xs transition-all cursor-pointer"
              title="Làm mới lại dữ liệu từ cơ sở dữ liệu"
            >
              <RefreshCw
                size={14}
                className={refreshing ? 'animate-spin text-blue-900' : ''}
              />
              <span className="hidden sm:inline">
                {refreshing ? 'Đang tải...' : 'Làm mới dữ liệu'}
              </span>
            </button>

            {/* Nút Theme Sáng / Tối */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-700/60 shadow-2xs transition-colors"
              title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
              aria-label="Đổi giao diện Sáng / Tối"
            >
              {theme === 'dark' ? (
                <Sun size={17} className="text-amber-400" />
              ) : (
                <Moon size={17} className="text-stone-700" />
              )}
            </button>

            {/* Avatar & User Dropdown preview */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-slate-800 text-xs">
              <div className="h-8 w-8 rounded-full bg-blue-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </div>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {user?.fullName || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Nội dung chính Admin Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Dedicated Admin Footer */}
        <footer className="border-t border-stone-200/80 dark:border-slate-800/80 py-4 px-6 text-center text-xs text-stone-400 dark:text-stone-500 bg-white/50 dark:bg-slate-900/50">
          Hệ thống Quản trị & Điều hành Maison E-Commerce © 2026. Kết nối PostgreSQL & Python AI Recommendation Engine.
        </footer>
      </div>
    </div>
  )
}
