import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useAuthStore } from '../../store/authStore'
import { categories } from '../../data/categories'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const totalItems = useCartStore((s) => s.totalItems())
  const wishCount = useWishlistStore((s) => s.productIds.length)
  const user = useAuthStore((s) => s.user)

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products')
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-stone">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Mở menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" className="font-display text-2xl tracking-tight shrink-0">
            Maison<span className="text-clay">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.id}`}
                className="text-ink-soft hover:text-clay transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-xs border border-stone-dark rounded-sm px-3 py-1.5 bg-paper"
          >
            <Search size={16} className="text-ink-soft shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full bg-transparent outline-none text-sm px-2"
            />
          </form>

          <div className="flex items-center gap-1">
            <Link to="/wishlist" className="relative p-2" aria-label="Wishlist">
              <Heart size={20} />
              {wishCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-clay text-paper text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2" aria-label="Giỏ hàng">
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-clay text-paper text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link
              to={user ? '/profile' : '/login'}
              className="p-2"
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
