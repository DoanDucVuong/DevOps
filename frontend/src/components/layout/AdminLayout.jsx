import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Store, LogOut, ShieldCheck, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../common/Toast'

export default function AdminLayout({ children }) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleLogout = () => {
    logout()
    showToast('Đã đăng xuất khỏi tài trị')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-stone-light/30 flex flex-col font-sans">
      {/* Dedicated Admin Header */}
      <header className="sticky top-0 z-40 bg-ink text-ivory border-b border-ink-soft/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="font-display text-2xl tracking-tight text-ivory flex items-center gap-2">
              Maison<span className="text-clay">.</span>
            </Link>
            <span className="text-xs bg-clay/90 text-ivory px-2 py-0.5 rounded uppercase font-semibold tracking-wider flex items-center gap-1">
              <ShieldCheck size={13} /> Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/products"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs md:text-sm text-ivory/80 hover:text-ivory bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors"
              title="Mở trang bán hàng dành cho khách hàng trong tab mới"
            >
              <Store size={15} />
              <span>Xem trang bán hàng</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-xs text-ivory/70 border-l border-white/20 pl-4">
              <User size={14} />
              <span>{user?.email || 'admin@sttn.vn'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs md:text-sm text-ivory/80 hover:text-red-400 border border-white/20 hover:border-red-400/40 px-3 py-1.5 rounded transition-colors"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={15} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Dedicated Admin Footer */}
      <footer className="border-t border-stone py-4 text-center text-xs text-ink-soft bg-paper">
        <div className="max-w-7xl mx-auto px-4">
          Hệ thống Quản trị & Điều hành Maison E-Commerce © 2026. Kết nối PostgreSQL & Python AI Recommendation Engine.
        </div>
      </footer>
    </div>
  )
}
