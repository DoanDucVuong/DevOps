import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/common/Toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const login = useAuthStore((s) => s.login)
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    const result = login(form)
    if (result.success) {
      showToast('Đăng nhập thành công')
      navigate(location.state?.from?.pathname || '/profile')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-2">Đăng nhập</h1>
      <p className="text-sm text-ink-soft mb-8">Chào mừng bạn quay lại Maison.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
            placeholder="ban@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Mật khẩu</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button type="submit" className="w-full py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors">
          Đăng nhập
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-6 text-center">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-clay hover:underline">Đăng ký ngay</Link>
      </p>
      <p className="text-xs text-ink-soft/70 mt-4 text-center">
        * Đây là hệ thống đăng nhập giả lập lưu trên LocalStorage, không kết nối máy chủ thật.
      </p>
    </div>
  )
}
