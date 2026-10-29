import React from 'react'
import {
  User,
  Receipt,
  MapPin,
  Gift,
  Star,
  Mail,
  ChevronRight,
} from 'lucide-react'
import MemberCard from './MemberCard'

export const NAV_ITEMS = [
  { id: 'personal-info', label: 'Thông tin cá nhân', icon: User },
  { id: 'orders', label: 'Lịch sử đơn hàng', icon: Receipt },
  { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
  { id: 'vouchers', label: 'Ưu đãi & Voucher', icon: Gift },
  { id: 'loyalty', label: 'Khách hàng thân thiết', icon: Star },
  { id: 'notifications', label: 'Thông báo & Hộp thư', icon: Mail },
]

export default function ProfileSidebar({
  user,
  totalSpent = 0,
  activeTab,
  onTabChange,
}) {
  return (
    <div className="space-y-4">
      {/* 1. Member Card sang trọng */}
      <MemberCard user={user} totalSpent={totalSpent} />

      {/* 2. Menu Navigation dạng List dọc */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-2 shadow-2xs divide-y divide-stone-100 dark:divide-slate-800/60">
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm transition-all text-left ${
                  isActive
                    ? 'font-bold text-stone-900 dark:text-white bg-stone-100 dark:bg-slate-800/80 shadow-2xs'
                    : 'font-normal text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-slate-800/40 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={`transition-colors shrink-0 ${
                      isActive
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-stone-400 dark:text-stone-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <ChevronRight
                  size={15}
                  className={`transition-transform shrink-0 ${
                    isActive
                      ? 'text-yellow-600 dark:text-yellow-400 translate-x-0.5'
                      : 'text-stone-300 dark:text-stone-600'
                  }`}
                />
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
