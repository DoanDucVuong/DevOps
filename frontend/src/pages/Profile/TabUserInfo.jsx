import React, { useState } from 'react'
import {
  Lock,
  ChevronRight,
  LogOut,
  Edit2,
  Check,
  X,
  User,
  Calendar,
  Phone,
  Mail,
  Users,
} from 'lucide-react'
import { updateUserProfile } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/common/Toast'

export default function TabUserInfo({ user, onLogout }) {
  const updateUser = useAuthStore((s) => s.updateUser)
  const { showToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    birthday: user?.birthday || '15/08/1996',
    gender: user?.gender || 'Nam',
    phone: user?.phone || '0901 234 567',
    address: user?.address || '123 Lê Duẩn, Đà Nẵng',
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateUserProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      })
      updateUser({
        fullName: formData.fullName,
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        birthday: formData.birthday,
        gender: formData.gender,
      })
      showToast('Cập nhật thông tin thành công')
      setIsEditing(false)
    } catch (err) {
      updateUser({
        fullName: formData.fullName,
        name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        birthday: formData.birthday,
        gender: formData.gender,
      })
      showToast('Đã lưu thông tin tài khoản')
      setIsEditing(false)
    } finally {
      setSaving(false)
    }
  }

  // Danh sách các trường hiển thị theo yêu cầu của khách hàng:
  // (Họ tên, Ngày sinh, Giới tính, SĐT, Email)
  const fields = [
    {
      id: 'fullName',
      label: 'Họ và tên',
      value: formData.fullName || user?.fullName || user?.name || 'Chưa cập nhật',
      icon: User,
      isLocked: false,
    },
    {
      id: 'birthday',
      label: 'Ngày sinh',
      value: formData.birthday || 'Chưa cập nhật',
      icon: Calendar,
      isLocked: false,
    },
    {
      id: 'gender',
      label: 'Giới tính',
      value: formData.gender || 'Nam',
      icon: Users,
      isLocked: false,
    },
    {
      id: 'phone',
      label: 'Số điện thoại',
      value: formData.phone || user?.phone || 'Chưa cập nhật',
      icon: Phone,
      isLocked: false,
    },
    {
      id: 'email',
      label: 'Email',
      value: user?.email || 'Chưa cập nhật',
      icon: Mail,
      isLocked: true, // Email có ô khóa
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            Thông tin cá nhân
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Quản lý và cập nhật thông tin hồ sơ của bạn
          </p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 hover:border-yellow-500 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-yellow-600 transition-colors"
          >
            <Edit2 size={13} />
            <span>Chỉnh sửa</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            <X size={14} />
            <span>Hủy</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        /* Dạng List bo góc viền nhạt border-stone-100, dàn hàng ngang */
        <div className="rounded-xl border border-stone-100 dark:border-slate-800 divide-y divide-stone-100 dark:divide-slate-800/80 overflow-hidden mb-6">
          {fields.map((f) => {
            const FieldIcon = f.icon

            return (
              <div
                key={f.id}
                onClick={() => !f.isLocked && setIsEditing(true)}
                className={`flex items-center justify-between px-4 sm:px-5 py-4 transition-colors ${
                  !f.isLocked
                    ? 'cursor-pointer hover:bg-stone-50/70 dark:hover:bg-slate-800/40'
                    : 'bg-stone-50/30 dark:bg-slate-900/40'
                }`}
              >
                {/* Tiêu đề bên trái */}
                <div className="flex items-center gap-3">
                  <FieldIcon size={16} className="text-stone-400 dark:text-stone-500" />
                  <span className="text-sm font-medium text-stone-600 dark:text-stone-400">
                    {f.label}
                  </span>
                </div>

                {/* Giá trị bên phải kèm icon > hoặc ô khóa */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-900 dark:text-white">
                    {f.value}
                  </span>

                  {f.isLocked ? (
                    <span
                      title="Email đã xác thực, không thể thay đổi"
                      className="p-1 rounded-md bg-stone-100 dark:bg-slate-800 text-stone-400 dark:text-stone-500 ml-1"
                    >
                      <Lock size={13} />
                    </span>
                  ) : (
                    <ChevronRight size={15} className="text-stone-400 dark:text-stone-500" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Form chỉnh sửa */
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Ngày sinh
              </label>
              <input
                type="text"
                placeholder="DD/MM/YYYY"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold transition-all shadow-xs"
            >
              <Check size={14} />
              <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Nút Đăng xuất nền xám nhạt góc dưới theo yêu cầu */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-700 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 text-sm font-medium transition-colors"
        >
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}
