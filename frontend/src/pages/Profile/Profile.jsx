import { Link, useNavigate } from 'react-router-dom'
import { User, Package, Heart, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/common/Toast'

export default function Profile() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('Đã đăng xuất')
    navigate('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="flex items-center gap-4 mb-10">
        <div className="h-16 w-16 rounded-full bg-stone flex items-center justify-center">
          <User size={26} className="text-ink-soft" />
        </div>
        <div>
          <h1 className="font-display text-2xl">{user?.name}</h1>
          <p className="text-sm text-ink-soft">{user?.email}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Link
          to="/orders"
          className="flex items-center gap-4 border border-stone rounded-sm p-5 hover:border-ink transition-colors"
        >
          <Package size={22} className="text-clay" />
          <div>
            <p className="font-medium text-sm">Lịch sử đơn hàng</p>
            <p className="text-xs text-ink-soft">Theo dõi trạng thái đơn hàng của bạn</p>
          </div>
        </Link>
        <Link
          to="/wishlist"
          className="flex items-center gap-4 border border-stone rounded-sm p-5 hover:border-ink transition-colors"
        >
          <Heart size={22} className="text-clay" />
          <div>
            <p className="font-medium text-sm">Sản phẩm yêu thích</p>
            <p className="text-xs text-ink-soft">Xem lại danh sách đã lưu</p>
          </div>
        </Link>
      </div>

      <div className="border border-stone rounded-sm p-6">
        <h2 className="font-display text-lg mb-4">Thông tin tài khoản</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-stone pb-3">
            <span className="text-ink-soft">Họ và tên</span>
            <span>{user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Email</span>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 mt-8 text-sm text-clay hover:underline"
      >
        <LogOut size={16} /> Đăng xuất
      </button>
    </div>
  )
}
