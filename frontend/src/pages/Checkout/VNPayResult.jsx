import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, ShoppingBag, Receipt, RotateCcw } from 'lucide-react'
import { formatCurrency } from '../../utils/format'

const VNPAY_ERROR_CODES = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ (liên quan tới gian lận).',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.',
  '12': 'Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Giao dịch bị hủy bởi khách hàng.',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.',
  '97': 'Chữ ký checksum không hợp lệ (Dữ liệu bị can thiệp).',
}

export default function VNPayResult() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const status = searchParams.get('status')
  const orderId = searchParams.get('orderId') || 'Chưa xác định'
  const amount = Number(searchParams.get('amount') || 0)
  const code = searchParams.get('code') || '00'
  const transNo = searchParams.get('transNo') || searchParams.get('transactionNo') || ''
  const bank = searchParams.get('bank') || searchParams.get('bankCode') || ''

  const isSuccess = status === 'success' || code === '00'
  const message = VNPAY_ERROR_CODES[code] || 'Giao dịch không thành công hoặc đã xảy ra lỗi.'

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="bg-paper border border-stone-dark rounded-md p-8 md:p-10 shadow-sm text-center">
        {isSuccess ? (
          <>
            <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={44} />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
              Thanh toán thành công
            </span>
            <h1 className="font-display text-3xl mb-2 text-ink">Cảm ơn bạn đã mua hàng!</h1>
            <p className="text-sm text-ink-soft mb-8">
              Đơn hàng của bạn đã được thanh toán an toàn qua cổng VNPAY và đang được Maison chuẩn bị đóng gói.
            </p>

            <div className="bg-stone/20 rounded-sm p-5 text-left space-y-3 mb-8 text-sm">
              <div className="flex justify-between pb-2 border-b border-stone-dark/30">
                <span className="text-ink-soft">Mã đơn hàng:</span>
                <span className="font-semibold text-ink">{orderId}</span>
              </div>
              {amount > 0 && (
                <div className="flex justify-between pb-2 border-b border-stone-dark/30">
                  <span className="text-ink-soft">Số tiền đã thanh toán:</span>
                  <span className="font-semibold text-emerald-700">{formatCurrency(amount)}</span>
                </div>
              )}
              {transNo && (
                <div className="flex justify-between pb-2 border-b border-stone-dark/30">
                  <span className="text-ink-soft">Mã giao dịch VNPAY:</span>
                  <span className="font-mono text-xs text-ink">{transNo}</span>
                </div>
              )}
              {bank && (
                <div className="flex justify-between pb-2 border-b border-stone-dark/30">
                  <span className="text-ink-soft">Ngân hàng thanh toán:</span>
                  <span className="font-medium text-ink uppercase">{bank}</span>
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-ink-soft">Phương thức:</span>
                <span className="font-medium text-ink">Cổng VNPAY (ATM/QR/Visa)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
              >
                <Receipt size={16} />
                Xem đơn hàng của tôi
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-dark text-sm rounded-sm hover:bg-stone/30 transition-colors"
              >
                <ShoppingBag size={16} />
                Tiếp tục mua sắm
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="h-20 w-20 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-6">
              <XCircle size={44} />
            </div>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
              Thanh toán không thành công
            </span>
            <h1 className="font-display text-2xl md:text-3xl mb-2 text-ink">Giao dịch bị gián đoạn</h1>
            <p className="text-sm text-rose-600 mb-6 font-medium">
              {message} (Mã lỗi: {code})
            </p>

            <div className="bg-stone/20 rounded-sm p-4 text-left space-y-2 mb-8 text-sm text-ink-soft">
              <p>• Mã đơn hàng liên quan: <strong className="text-ink">{orderId}</strong></p>
              <p>• Đơn hàng vẫn được lưu ở trạng thái chờ thanh toán. Quý khách có thể thử lại hoặc chọn phương thức COD.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors"
              >
                <RotateCcw size={16} />
                Thử thanh toán lại
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-dark text-sm rounded-sm hover:bg-stone/30 transition-colors"
              >
                <Receipt size={16} />
                Kiểm tra đơn hàng
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
