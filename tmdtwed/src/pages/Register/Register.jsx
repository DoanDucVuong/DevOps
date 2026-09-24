import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/common/Toast'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const register = useAuthStore((s) => s.register)
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    if (form.password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.')
      return
    }
    const result = register(form)
    if (result.success) {
      showToast('Tạo tài khoản thành công')
      navigate('/profile')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-display text-3xl mb-2">Đăng ký</h1>
      <p className="text-sm text-ink-soft mb-8">Tạo tài khoản để lưu đơn hàng và sản phẩm yêu thích.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Họ và tên</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
            placeholder="Nguyễn Văn A"
          />
        </div>
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
            placeholder="Tối thiểu 6 ký tự"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Nhập lại mật khẩu</label>
          <input
            type="password"
            required
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            className="w-full border border-stone-dark rounded-sm px-3 py-2.5 text-sm bg-paper outline-none focus:border-ink"
          />
        </div>

        {error && <p className="text-sm text-clay">{error}</p>}

        <button type="submit" className="w-full py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors">
          Tạo tài khoản
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-6 text-center">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-clay hover:underline">Đăng nhập</Link>
      </p>
    </div>
  )
}
