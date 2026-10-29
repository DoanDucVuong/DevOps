import React, { useState } from 'react'
import { MapPin, Plus, CheckCircle2, Trash2 } from 'lucide-react'
import AddressModal from './AddressModal'
import { useToast } from '../../components/common/Toast'

export default function TabAddresses({ user }) {
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)

  const [addresses, setAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('maison-user-addresses')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      // fallback
    }
    return [
      {
        id: 'addr-1',
        recipientName: user?.fullName || user?.name || 'Khách hàng Maison',
        phone: user?.phone || '0901 234 567',
        address: user?.address || '123 Lê Duẩn, Phường Thạch Thang',
        city: 'Đà Nẵng',
        district: 'Hải Châu',
        isDefault: true,
      },
    ]
  })

  const saveAddresses = (list) => {
    setAddresses(list)
    try {
      localStorage.setItem('maison-user-addresses', JSON.stringify(list))
    } catch (e) {
      // ignore
    }
  }

  const handleAddAddress = (newAddr) => {
    let next
    if (newAddr.isDefault) {
      next = [newAddr, ...addresses.map((a) => ({ ...a, isDefault: false }))]
    } else {
      next = [...addresses, newAddr]
    }
    saveAddresses(next)
    showToast('Đã thêm địa chỉ giao hàng mới')
  }

  const handleDelete = (id) => {
    if (addresses.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 địa chỉ giao hàng')
      return
    }
    const next = addresses.filter((a) => a.id !== id)
    saveAddresses(next)
    showToast('Đã xóa địa chỉ')
  }

  const handleSetDefault = (id) => {
    const next = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }))
    saveAddresses(next)
    showToast('Đã đặt làm địa chỉ mặc định')
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-white">
            Sổ địa chỉ nhận hàng
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Quản lý các địa điểm nhận hàng thuận tiện cho việc đặt hàng
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold transition-all shadow-xs"
        >
          <Plus size={15} />
          <span>Thêm địa chỉ</span>
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              addr.isDefault
                ? 'border-yellow-400 bg-yellow-50/30 dark:bg-yellow-950/20'
                : 'border-stone-200 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900 dark:text-white">
                  {addr.recipientName}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                  {addr.phone}
                </span>
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/90 text-stone-900">
                    <CheckCircle2 size={11} /> Mặc định
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 flex items-start gap-1.5">
                <MapPin size={14} className="text-stone-400 shrink-0 mt-0.5" />
                <span>{addr.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              {!addr.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(addr.id)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 dark:border-slate-700 text-stone-600 dark:text-stone-300 hover:border-yellow-400 hover:text-yellow-600"
                >
                  Thiết lập mặc định
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDelete(addr.id)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Xóa địa chỉ"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm địa chỉ */}
      <AddressModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddAddress}
      />
    </div>
  )
}
