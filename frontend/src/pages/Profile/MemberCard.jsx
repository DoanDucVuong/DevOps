import React from 'react'
import { Star } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

export default function MemberCard({ user, totalSpent = 0, isLarge = false }) {
  const displayName = user?.fullName || user?.name || user?.email?.split('@')[0] || 'Khách hàng'

  // Phân hạng thành viên theo mức chi tiêu
  // 0 - 999.000: Member
  // 1.000.000 - 1.999.000: ICON Member
  // 2.000.000 - 4.999.000: Silver
  // 5.000.000 - 9.999.000: Gold
  // >= 10.000.000: DIAMOND
  const getTierDetails = (spent) => {
    if (spent >= 10000000) {
      return {
        tag: 'DIAMOND',
        currentGoal: 10000000,
        nextTier: null,
        needed: 0,
        percent: 100,
        message: 'Bạn đã đạt cấp độ hội viên cao nhất!',
      }
    }
    if (spent >= 5000000) {
      return {
        tag: 'Gold',
        currentGoal: 5000000,
        nextTier: 'DIAMOND',
        needed: 10000000 - spent,
        percent: Math.min(100, Math.round((spent / 10000000) * 100)),
        message: `Chi tiêu thêm ${formatCurrency(10000000 - spent)} để lên hạng DIAMOND`,
      }
    }
    if (spent >= 2000000) {
      return {
        tag: 'Silver',
        currentGoal: 2000000,
        nextTier: 'Gold',
        needed: 5000000 - spent,
        percent: Math.min(100, Math.round((spent / 5000000) * 100)),
        message: `Chi tiêu thêm ${formatCurrency(5000000 - spent)} để lên hạng Gold`,
      }
    }
    if (spent >= 1000000) {
      return {
        tag: 'ICON Member',
        currentGoal: 1000000,
        nextTier: 'Silver',
        needed: 2000000 - spent,
        percent: Math.min(100, Math.round((spent / 2000000) * 100)),
        message: `Chi tiêu thêm ${formatCurrency(2000000 - spent)} để lên hạng Silver`,
      }
    }
    return {
      tag: 'Member',
      currentGoal: 0,
      nextTier: 'ICON Member',
      needed: 1000000 - spent,
      percent: Math.min(100, Math.round((spent / 1000000) * 100)),
      message: `Chi tiêu thêm ${formatCurrency(1000000 - spent)} để lên hạng ICON Member`,
    }
  }

  const tier = getTierDetails(totalSpent)

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-900 via-[#5c3a21] to-[#3d2312] text-white shadow-lg border border-amber-800/40 select-none ${
        isLarge ? 'p-6 sm:p-8' : 'p-4 sm:p-5'
      }`}
    >
      {/* Họa tiết ánh sáng trang trí góc thẻ */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />

      {/* Dòng Header thẻ: Tag Member & Icon Ngôi sao tròn */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase border border-white/30 bg-white/10 backdrop-blur-xs text-amber-100 ${
            isLarge ? 'text-xs px-3 py-1' : 'text-[11px]'
          }`}
        >
          {tier.tag}
        </span>

        <div className="h-7 w-7 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 text-yellow-300 shadow-2xs">
          <Star size={14} className="fill-yellow-300" />
        </div>
      </div>

      {/* Tên khách hàng */}
      <div className="relative z-10 mb-5">
        <h3
          className={`font-bold tracking-tight text-white leading-tight truncate ${
            isLarge ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
          }`}
          title={displayName}
        >
          {displayName}
        </h3>
        <p className="text-xs text-amber-200/70 font-mono mt-0.5">
          {user?.email || 'member@maison.vn'}
        </p>
      </div>

      {/* Thanh tiến trình chi tiêu (Progress bar) */}
      <div className="relative z-10 space-y-1.5">
        <div className="flex justify-between items-center text-[11px] text-amber-100/90 font-medium">
          <span>Chi tiêu tích lũy</span>
          <span className="font-bold text-yellow-300">{formatCurrency(totalSpent)}</span>
        </div>

        {/* Thanh bar mỏng */}
        <div className="h-1.5 w-full bg-black/25 rounded-full overflow-hidden p-[1px] border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-200 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(4, tier.percent)}%` }}
          />
        </div>

        {/* Dòng chữ nhỏ giải thích */}
        <p className="text-[11px] text-amber-200/80 leading-snug">
          {tier.message}
        </p>
      </div>
    </div>
  )
}
