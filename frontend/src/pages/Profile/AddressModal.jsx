import React, { useState } from 'react'
import { X, MapPin } from 'lucide-react'

export default function AddressModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Đà Nẵng')
  const [detail, setDetail] = useState('')
  const [isDefault, setIsDefault] = useState(true)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !detail.trim()) return

    onSave({
      id: Date.now().toString(),
      recipientName: name.trim(),
      phone: phone.trim(),
      address: `${detail.trim()}, ${city}`,
      isDefault,
    })

    // Reset
    setName('')
    setPhone('')
    setDetail('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Modal nền trắng rounded-2xl theo yêu cầu */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl max-w-lg w-full relative">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <MapPin size={18} className="text-yellow-500" />
            <span>Thêm địa chỉ giao hàng mới</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Họ và tên người nhận
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Số điện thoại
              </label>
              <input
                type="tel"
                required
                placeholder="09xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                Tỉnh / Thành phố
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
              >
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
              Địa chỉ chi tiết (Số nhà, tên đường, phường/xã)
            </label>
            <textarea
              required
              rows={2}
              placeholder="Ví dụ: 123 Lê Duẩn, Phường Thạch Thang, Quận Hải Châu"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-stone-900 dark:text-white outline-none focus:border-yellow-400"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded accent-yellow-400 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
              Đặt làm địa chỉ nhận hàng mặc định
            </span>
          </label>

          {/* Nút Hủy (nền xám), nút Thêm (nền vàng bg-yellow-400) theo yêu cầu */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-stone-200 text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-sm font-bold shadow-xs transition-colors"
            >
              Thêm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
