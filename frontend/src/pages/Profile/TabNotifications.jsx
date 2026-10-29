import React from 'react'
import { Mail, Bell, CheckCircle2, Tag, Truck } from 'lucide-react'

export default function TabNotifications() {
  const notifications = [
    {
      id: 1,
      title: 'Chào mừng bạn đến với Maison Club!',
      time: 'Hôm nay',
      desc: 'Tài khoản của bạn đã được nâng cấp lên hạng thành viên ưu tiên với nhiều đặc quyền hấp dẫn.',
      icon: Bell,
      color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/80 dark:text-yellow-400',
    },
    {
      id: 2,
      title: 'Voucher chào mừng dành riêng cho bạn',
      time: 'Hôm qua',
      desc: 'Mã FREESHIP và MAISON10 đã sẵn sàng trong ví của bạn. Áp dụng ngay cho đơn hàng kế tiếp.',
      icon: Tag,
      color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400',
    },
    {
      id: 3,
      title: 'Cập nhật chính sách giao hàng hỏa tốc',
      time: '3 ngày trước',
      desc: 'Maison hỗ trợ giao hàng trong 24 giờ cho khu vực Đà Nẵng, Hà Nội và TP. Hồ Chí Minh.',
      icon: Truck,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400',
    },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
      <div className="pb-4 mb-5 border-b border-stone-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Mail size={20} className="text-yellow-500" />
          <span>Thông báo & Hộp thư</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Cập nhật các thông báo đơn hàng, khuyến mãi và chính sách mới nhất
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-stone-100 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/40 flex items-start gap-3.5 transition-all hover:border-stone-200"
            >
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.color}`}
              >
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-stone-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-stone-400 shrink-0 font-medium">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
