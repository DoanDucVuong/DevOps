import React, { useState } from 'react'
import { Star, Check, Sparkles, Gift, Shield, Zap } from 'lucide-react'
import MemberCard from './MemberCard'

const TIERS = [
  {
    id: 'member',
    label: 'Member',
    minSpent: 0,
    starColor: 'text-amber-700 fill-amber-700',
    starBorder: 'border-amber-700/30 bg-amber-50 dark:bg-amber-950/40',
    perks: [
      'Tích lũy 1% giá trị mọi đơn hàng vào điểm thưởng Maison',
      'Nhận thông báo ưu đãi độc quyền qua email & SMS',
      'Đổi trả hàng thuận tiện trong vòng 15 ngày tại nhà',
    ],
  },
  {
    id: 'icon',
    label: 'ICON Member',
    minSpent: 1000000,
    starColor: 'text-sky-500 fill-sky-500',
    starBorder: 'border-sky-500/30 bg-sky-50 dark:bg-sky-950/40',
    perks: [
      'Tích lũy 2% giá trị đơn hàng vào điểm thưởng',
      'Voucher sinh nhật giảm 15% áp dụng toàn bộ bộ sưu tập',
      'Miễn phí vận chuyển cho đơn hàng từ 300.000₫',
      'Quyền truy cập phòng trưng bày sản phẩm mới sớm 24h',
    ],
  },
  {
    id: 'silver',
    label: 'Silver',
    minSpent: 2000000,
    starColor: 'text-slate-400 fill-slate-400',
    starBorder: 'border-slate-400/30 bg-slate-100 dark:bg-slate-800',
    perks: [
      'Tích lũy 3% giá trị đơn hàng vào ví điểm',
      'Voucher sinh nhật giảm 20% + Quà tặng phụ kiện Maison',
      'Miễn phí vận chuyển toàn quốc không giới hạn giá trị đơn',
      'Hỗ trợ đổi size và đổi mẫu tận nhà trong 30 ngày',
    ],
  },
  {
    id: 'gold',
    label: 'Gold',
    minSpent: 5000000,
    starColor: 'text-yellow-500 fill-yellow-500',
    starBorder: 'border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/40',
    perks: [
      'Tích lũy 4% điểm thưởng cho mỗi lượt thanh toán',
      'Voucher sinh nhật giảm 25% + Hộp quà thời trang cao cấp',
      'Miễn phí giao hàng hỏa tốc trong 2 giờ tại các thành phố lớn',
      'Ưu tiên giữ size cho các bộ sưu tập giới hạn (Limited Drop)',
      'Hỗ trợ cắt gấu, chỉnh form trang phục miễn phí theo yêu cầu',
    ],
  },
  {
    id: 'diamond',
    label: 'DIAMOND',
    minSpent: 10000000,
    starColor: 'text-cyan-400 fill-cyan-400',
    starBorder: 'border-cyan-400/30 bg-cyan-50 dark:bg-cyan-950/40',
    perks: [
      'Tích lũy 5% điểm thưởng hoàn tiền không giới hạn',
      'Voucher mừng sinh nhật giảm 30% cho khách hàng VIP',
      'Trợ lý phong cách cá nhân tư vấn mix & match 1-1',
      'Đặc quyền tham dự các sự kiện thời trang Private Show của Maison',
      'Đổi trả hàng trọn đời miễn phí không cần hóa đơn',
    ],
  },
]

export default function TabLoyalty({ user, totalSpent = 0 }) {
  const [selectedTier, setSelectedTier] = useState('gold')

  const currentTierData =
    TIERS.find((t) => t.id === selectedTier) || TIERS[0]

  return (
    <div className="space-y-6">
      {/* 1. THẺ MEMBER CARD SIZE TO HƠN ĐẶT LÊN ĐẦU THEO YÊU CẦU */}
      <MemberCard user={user} totalSpent={totalSpent} isLarge={true} />

      {/* 2. DẢI TABS HIỂN THỊ HẠNG (MEMBER, ICON MEMBER, SILVER, GOLD, DIAMOND) KÈM ICON SAO TƯƠNG ỨNG MÀU */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 px-1">
          Các cấp bậc thành viên Maison Club
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {TIERS.map((tier) => {
            const isActive = selectedTier === tier.id

            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedTier(tier.id)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isActive
                    ? 'border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/30 shadow-xs ring-1 ring-yellow-400/30'
                    : 'border-stone-200 dark:border-slate-800 hover:border-stone-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                {/* Icon Sao tương ứng màu */}
                <div
                  className={`h-8 w-8 rounded-full border flex items-center justify-center ${tier.starBorder}`}
                >
                  <Star size={16} className={tier.starColor} />
                </div>

                <span
                  className={`text-xs font-bold uppercase tracking-wider truncate w-full ${
                    isActive
                      ? 'text-yellow-700 dark:text-yellow-400'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {tier.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. KHỐI QUYỀN LỢI HẠNG THÀNH VIÊN: DANH SÁCH CÁC THẺ CÓ ICON CHECK (✓) PHÍA TRƯỚC */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              <span>Quyền lợi độc quyền hạng {currentTierData.label}</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Áp dụng cho mọi giao dịch mua sắm trực tuyến và tại hệ thống cửa hàng
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-slate-800 text-stone-700 dark:text-stone-300">
            Từ {currentTierData.minSpent.toLocaleString('vi-VN')}₫
          </span>
        </div>

        {/* Danh sách thẻ quyền lợi với icon check (✓) phía trước */}
        <div className="grid sm:grid-cols-2 gap-3">
          {currentTierData.perks.map((perk, index) => (
            <div
              key={index}
              className="p-3.5 rounded-xl border border-stone-100 dark:border-slate-800/80 bg-stone-50/50 dark:bg-slate-800/40 flex items-start gap-3 transition-colors hover:border-yellow-200"
            >
              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={13} className="stroke-[3]" />
              </div>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
                {perk}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
