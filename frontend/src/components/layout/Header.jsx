import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X, LayoutDashboard, Sun, Moon } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useThemeStore } from '../../store/themeStore'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const categories = useCategoryStore((s) => s.categories)
  const fetchCategories = useCategoryStore((s) => s.fetchCategories)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const totalItems = useCartStore((s) => s.totalItems())
  const wishCount = useWishlistStore((s) => s.productIds.length)
  const user = useAuthStore((s) => s.user)
  const { theme, toggleTheme } = useThemeStore()

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            className="md:hidden p-2 -ml-2 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Mở menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="font-sans font-black text-2xl tracking-tight shrink-0 text-stone-900 dark:text-white">
            Maison<span className="text-blue-900 dark:text-blue-400">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm">
            <Link
              to="/products?gender=Nam"
              className="font-bold text-stone-800 dark:text-stone-200 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
            >
              Đồ Nam
            </Link>
            <Link
              to="/products?gender=Nữ"
              className="font-bold text-stone-800 dark:text-stone-200 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
            >
              Đồ Nữ
            </Link>
            <span className="h-4 w-px bg-stone-200 dark:bg-slate-700" />
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="text-stone-600 dark:text-stone-300 hover:text-blue-900 dark:hover:text-blue-400 font-medium transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xs border border-stone-200 dark:border-slate-700 rounded-full px-3.5 py-1.5 bg-stone-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-blue-900 dark:focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-900/10 transition-all shadow-2xs"
          >
            <Search size={15} className="text-stone-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full bg-transparent outline-none text-xs sm:text-sm px-2 text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
            />
          </form>

          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-blue-900 dark:hover:text-blue-400 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
              aria-label="Đổi giao diện Sáng / Tối"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-amber-400 animate-in spin-in-45" />
              ) : (
                <Moon size={20} className="text-stone-700" />
              )}
            </button>

            {user?.role === 'admin' && (
              <Link to="/admin" className="p-2 text-stone-700 dark:text-stone-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors" aria-label="Quản trị">
                <LayoutDashboard size={20} />
              </Link>
            )}
            <Link to="/wishlist" className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors" aria-label="Wishlist">
              <Heart size={20} />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2 text-stone-700 dark:text-stone-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors" aria-label="Giỏ hàng">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-900 dark:bg-blue-600 text-white font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              to={user ? '/profile' : '/login'}
              className="p-2 text-stone-700 dark:text-stone-300 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
              aria-label={user ? 'Tài khoản' : 'Đăng nhập'}
            >
              <User size={20} />
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <form onSubmit={handleSearch} className="flex items-center border border-stone-dark rounded-sm px-3 py-2">
              <Search size={16} className="text-ink-soft shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm sản phẩm..."
                className="w-full bg-transparent outline-none text-sm px-2"
              />
            </form>
            <nav className="flex flex-col gap-1">
              <Link
                to="/products?gender=Nam"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-sm font-medium text-clay border-b border-stone"
              >
                👕 Đồ Nam
              </Link>
              <Link
                to="/products?gender=Nữ"
                onClick={() => setMenuOpen(false)}
                className="py-2 text-sm font-medium text-clay border-b border-stone"
              >
                👗 Đồ Nữ
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/products?category=${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm border-b border-stone last:border-0"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
