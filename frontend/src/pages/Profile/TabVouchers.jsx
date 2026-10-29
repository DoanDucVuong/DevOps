import React, { useState } from 'react'
import { Tag, Copy, Check } from 'lucide-react'
import { useToast } from '../../components/common/Toast'

export default function TabVouchers() {
  const { showToast } = useToast()
  const [copiedCode, setCopiedCode] = useState(null)

  const vouchers = [
    {
      code: 'MAISON10',
      title: 'Giảm 10% đơn hàng',
      desc: 'Áp dụng cho đơn hàng từ 300.000₫. Giảm tối đa 100.000₫.',
      exp: 'Hạn dùng: 31/12/2026',
      badge: 'Toàn sàn',
    },
    {
      code: 'GIAM50K',
      title: 'Giảm trực tiếp 50.000₫',
      desc: 'Áp dụng cho đơn hàng từ 500.000₫. Không áp dụng cùng CTKM khác.',
      exp: 'Hạn dùng: Còn 15 ngày',
      badge: 'Hot',
    },
    {
      code: 'FREESHIP',
      title: 'Miễn phí vận chuyển',
      desc: 'Miễn phí giao hàng toàn quốc cho đơn hàng từ 200.000₫.',
      exp: 'Hạn dùng: Vô thời hạn',
      badge: 'Freeship',
    },
  ]

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    showToast(`Đã sao chép mã ${code}`)
    setTimeout(() => setCopiedCode(null), 2500)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-stone-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
      <div className="pb-4 mb-5 border-b border-stone-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
          <Tag size={20} className="text-yellow-500" />
          <span>Kho Voucher & Ưu đãi của bạn</span>
        </h2>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Sao chép mã giảm giá và áp dụng trực tiếp tại bước Thanh toán
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {vouchers.map((v) => (
          <div
            key={v.code}
            className="p-4 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-br from-amber-50/50 to-orange-50/20 dark:from-slate-800 dark:to-slate-800/80 flex flex-col justify-between relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-sm font-bold text-blue-900 dark:text-yellow-400 tracking-wider">
                  {v.code}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-stone-900">
                  {v.badge}
                </span>
              </div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white mb-1">
                {v.title}
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {v.desc}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-amber-200/50 dark:border-slate-700">
              <span className="text-[11px] text-stone-400">{v.exp}</span>
              <button
                type="button"
                onClick={() => handleCopy(v.code)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-xs font-bold transition-all shadow-2xs"
              >
                {copiedCode === v.code ? (
                  <>
                    <Check size={13} className="text-emerald-800" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
