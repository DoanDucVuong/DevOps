import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import initialProvinces from '../../utils/vietnamProvinces.json'
import {
  CheckCircle2,
  Truck,
  CreditCard,
  QrCode,
  Ticket,
  Tag,
  X,
  Copy,
  Check,
  AlertCircle,
  Building2,
  ChevronRight,
  ShieldCheck,
  Minus,
  Plus,
  Sparkles,
  ShoppingBag,
  ArrowLeft,
  MapPin,
} from 'lucide-react'
import { useCartStore, lineKey } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useOrderStore } from '../../store/orderStore'
import { createOrder, createPaymentUrl, applyVoucher, IS_BACKEND } from '../../api/client'
import { formatCurrency } from '../../utils/format'
import { useToast } from '../../components/common/Toast'

const VIETQR_CONFIG = {
  bankName: 'Timo Digital Bank (VPBank)',
  bankBin: '970436',
  bankCode: 'timo',
  accountNumber: '0352294912',
  accountName: 'DOAN DUC VUONG',
}

const PAYMENT_METHODS = [
  {
    id: 'vietqr',
    label: 'Chuyển khoản VietQR',
    icon: QrCode,
    badge: 'Khuyên dùng',
    desc: 'Quét mã QR tự động điền số tiền & nội dung qua App Ngân hàng (Timo)',
  },
  {
    id: 'vnpay',
    label: 'Cổng thanh toán VNPAY',
    icon: CreditCard,
    badge: 'Cổng VNPAY',
    desc: 'Thanh toán tức thì qua thẻ ATM nội địa, QR Pay hoặc thẻ Quốc tế (Visa / Master)',
  },
  {
    id: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    icon: Truck,
    badge: 'Tiền mặt',
    desc: 'Thanh toán bằng tiền mặt khi shipper giao kiện hàng tận nhà',
  },
]

const QUICK_VOUCHERS = [
  { code: 'MAISON10', label: 'GIẢM 10%', desc: 'Đơn từ 400K' },
  { code: 'GIAM20K', label: 'VOUCHER 20K', desc: 'Đơn từ 299K' },
  { code: 'GIAM50K', label: 'VOUCHER 50K', desc: 'Đơn từ 599K' },
  { code: 'GIAM80K', label: 'VOUCHER 80K', desc: 'Đơn từ 799K' },
  { code: 'FREESHIP', label: 'FREESHIP', desc: 'Đơn từ 500K' },
]

export default function Checkout() {
  const { showToast } = useToast()
  const location = useLocation()
  const rawBuyNowItem = location.state?.buyNowItem

  const [buyNowItem, setBuyNowItem] = useState(() => {
    if (!rawBuyNowItem) return null
    return {
      ...rawBuyNowItem,
      id: rawBuyNowItem.id || rawBuyNowItem.productId,
      productId: rawBuyNowItem.productId || rawBuyNowItem.id,
      color: rawBuyNowItem.color || rawBuyNowItem.selectedColor || 'den',
      size: rawBuyNowItem.size || rawBuyNowItem.selectedSize || 'M',
      quantity: Number(rawBuyNowItem.quantity) || 1,
    }
  })

  const isBuyNow = Boolean(buyNowItem)
  const cartItems = useCartStore((s) => s.items)
  const cartTotalPrice = useCartStore((s) => s.totalPrice())
  const clearCart = useCartStore((s) => s.clearCart)
  const cartRemoveItem = useCartStore((s) => s.removeItem)
  const cartUpdateQuantity = useCartStore((s) => s.updateQuantity)
  const cartVoucher = useCartStore((s) => s.appliedVoucher)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  // 1. Danh sách sản phẩm thanh toán:
  // Nếu là đơn "Mua ngay" -> Chỉ lấy duy nhất [buyNowItem]
  // Nếu là thanh toán từ giỏ hàng -> Lấy cartItems
  const items = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems

  // 2. Tính tiền tạm tính (subtotal) dựa trên danh sách sản phẩm thanh toán
  const totalPrice = isBuyNow
    ? Math.round(Number(buyNowItem?.price || 0) * Number(buyNowItem?.quantity || 1))
    : cartTotalPrice

  const handleUpdateItemQuantity = (targetItem, newQty) => {
    if (isBuyNow) {
      if (newQty < 1) {
        setBuyNowItem(null)
      } else {
        setBuyNowItem((prev) => (prev ? { ...prev, quantity: newQty } : null))
      }
    } else {
      const key = lineKey(targetItem)
      if (newQty < 1) {
        cartRemoveItem(key)
      } else {
        cartUpdateQuantity(key, newQty)
      }
    }
  }

  const handleRemoveSingleItem = (targetItem) => {
    if (isBuyNow) {
      setBuyNowItem(null)
      showToast(`Đã xóa ${targetItem.name} khỏi thanh toán`)
    } else {
      const key = lineKey(targetItem)
      cartRemoveItem(key)
      showToast(`Đã xóa ${targetItem.name} khỏi giỏ hàng`)
    }
  }

  const [form, setForm] = useState({
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: '',
    district: '',
    note: '',
  })
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [provinces, setProvinces] = useState(initialProvinces || [])
  const [districts, setDistricts] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)

  // 1. Tải danh sách 63 tỉnh thành & quận huyện từ Open API Việt Nam
  useEffect(() => {
    let active = true
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const res = await fetch('https://provinces.open-api.vn/api/?depth=2')
        if (!res.ok) throw new Error('API fetch error')
        const data = await res.json()
        if (active && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((p) => ({
            name: p.name,
            code: p.code,
            districts: Array.isArray(p.districts)
              ? p.districts.map((d) => (typeof d === 'string' ? d : d.name))
              : [],
          }))
          setProvinces(formatted)
        }
      } catch (err) {
        console.warn('Lỗi tải API tỉnh thành, dùng 63 tỉnh thành dự phòng:', err)
      } finally {
        if (active) setLoadingProvinces(false)
      }
    }

    fetchProvinces()
    return () => {
      active = false
    }
  }, [])

  // 2. Cập nhật state districts khi form.city thay đổi
  useEffect(() => {
    if (!form.city) {
      setDistricts([])
      return
    }

    const matchedProvince = provinces.find(
      (p) =>
        p.name.toLowerCase() === form.city.toLowerCase() ||
        p.name.replace(/^(Thành phố|Tỉnh)\s+/i, '').toLowerCase() ===
          form.city.replace(/^(Thành phố|Tỉnh)\s+/i, '').toLowerCase() ||
        form.city.toLowerCase().includes(p.name.replace(/^(Thành phố|Tỉnh)\s+/i, '').toLowerCase())
    )

    if (matchedProvince && Array.isArray(matchedProvince.districts)) {
      const list = matchedProvince.districts.map((d) => (typeof d === 'string' ? d : d.name))
      setDistricts(list)
    } else {
      setDistricts([])
    }
  }, [form.city, provinces])

  const getSavedAddresses = () => {
    try {
      const saved = localStorage.getItem('maison-user-addresses')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'addr-default',
        recipientName: user?.fullName || user?.name || 'Khách hàng Maison',
        phone: user?.phone || '0901 234 567',
        address: user?.address || '123 Lê Duẩn, Phường Thạch Thang',
        city: 'Thành phố Đà Nẵng',
        district: 'Quận Hải Châu',
        isDefault: true,
      },
      {
        id: 'addr-office',
        recipientName: user?.fullName || user?.name || 'Khách hàng Maison',
        phone: user?.phone || '0901 234 567',
        address: 'Tòa nhà Bitexco, 2 Hải Triều, Phường Bến Nghé',
        city: 'Thành phố Hồ Chí Minh',
        district: 'Quận 1',
        isDefault: false,
      },
    ]
  }

  // Tự động lưu địa chỉ vào Sổ địa chỉ nếu chưa tồn tại
  const saveAddressIfNew = (addressData) => {
    try {
      if (!addressData.address?.trim() || !addressData.phone?.trim()) return
      const currentList = getSavedAddresses()
      const normPhone = addressData.phone.replace(/\s+/g, '')
      const normAddr = addressData.address.trim().toLowerCase()

      const isExisted = currentList.some((item) => {
        const itemPhone = (item.phone || '').replace(/\s+/g, '')
        const itemAddr = (item.address || '').trim().toLowerCase()
        return itemPhone === normPhone && itemAddr === normAddr
      })

      if (!isExisted) {
        const newAddressItem = {
          id: 'addr-' + Date.now(),
          recipientName: addressData.fullName?.trim() || user?.fullName || user?.name || 'Khách hàng',
          phone: addressData.phone?.trim() || '',
          address: addressData.address?.trim() || '',
          city: addressData.city?.trim() || '',
          district: addressData.district?.trim() || '',
          isDefault: currentList.length === 0,
        }
        const updated = [...currentList, newAddressItem]
        localStorage.setItem('maison-user-addresses', JSON.stringify(updated))
      }
    } catch (err) {
      console.warn('Could not auto-save address to localStorage:', err)
    }
  }

  const handleSelectSavedAddress = (addr) => {
    const rawCity = (addr.city || '').trim()
    const rawDistrict = (addr.district || '').trim()

    // Khớp tên tỉnh trong danh sách 63 tỉnh thành
    const matchedProv = provinces.find(
      (p) =>
        p.name.toLowerCase() === rawCity.toLowerCase() ||
        p.name.replace(/^(Thành phố|Tỉnh)\s+/i, '').toLowerCase() ===
          rawCity.replace(/^(Thành phố|Tỉnh)\s+/i, '').toLowerCase() ||
        rawCity.toLowerCase().includes(p.name.replace(/^(Thành phố|Tỉnh)\s+/i, '').toLowerCase())
    )

    const finalCity = matchedProv ? matchedProv.name : rawCity
    let finalDistrict = rawDistrict

    if (matchedProv && Array.isArray(matchedProv.districts)) {
      const distNames = matchedProv.districts.map((d) => (typeof d === 'string' ? d : d.name))
      const matchedDist = distNames.find(
        (d) =>
          d.toLowerCase() === rawDistrict.toLowerCase() ||
          d.replace(/^(Quận|Huyện|Thị xã)\s+/i, '').toLowerCase() ===
            rawDistrict.replace(/^(Quận|Huyện|Thị xã)\s+/i, '').toLowerCase() ||
          rawDistrict.toLowerCase().includes(d.replace(/^(Quận|Huyện|Thị xã)\s+/i, '').toLowerCase())
      )
      if (matchedDist) {
        finalDistrict = matchedDist
      }
    }

    setForm((prev) => ({
      ...prev,
      fullName: addr.recipientName || addr.fullName || prev.fullName,
      phone: addr.phone || prev.phone,
      address: addr.address || prev.address,
      city: finalCity,
      district: finalDistrict,
    }))
    setShowAddressModal(false)
    showToast(`Đã tự động điền địa chỉ của ${addr.recipientName || addr.fullName || 'bạn'}`)
  }
  const [payment, setPayment] = useState('vietqr')
  const [orderId, setOrderId] = useState(null)
  const [vietQrOrder, setVietQrOrder] = useState(null)
  const [copiedField, setCopiedField] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const addOrder = useOrderStore((s) => s.addOrder)

  // Voucher state - tự động thừa hưởng nếu đã áp dụng ở giỏ hàng
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(cartVoucher)
  const [voucherError, setVoucherError] = useState('')
  const [applyingVoucher, setApplyingVoucher] = useState(false)

  // Ngưỡng Freeship 500.000đ
  const shippingFee = totalPrice >= 500000 || totalPrice === 0 ? 0 : 30000
  const discountAmount = appliedVoucher
    ? Number(appliedVoucher.discountAmount || appliedVoucher.discount_amount || 0)
    : 0
  const grandTotal = Math.max(0, totalPrice - discountAmount + shippingFee)

  // Tiến độ đạt Freeship
  const freeshipProgress = Math.min(100, Math.round((totalPrice / 500000) * 100))
  const remainingForFreeship = Math.max(0, 500000 - totalPrice)

  const handleApplyVoucher = async (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : voucherInput).trim().toUpperCase()
    if (!code) return
    setVoucherError('')
    setApplyingVoucher(true)
    try {
      const res = await applyVoucher(code, totalPrice)
      setAppliedVoucher(res)
      setVoucherInput(code)
      const codeName = res.code || res.voucher?.code || code
      const savedAmount = res.discountAmount || res.discount_amount || 0
      showToast(`Áp dụng mã ${codeName} thành công (-${formatCurrency(savedAmount)})`)
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện đơn hàng.'
      setVoucherError(errMsg)
      showToast(errMsg)
      setAppliedVoucher(null)
    } finally {
      setApplyingVoucher(false)
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
    setVoucherError('')
    showToast('Đã hủy áp dụng mã giảm giá.')
  }

  const handleConfirm = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!')
      return
    }

    // Tự động lưu địa chỉ mới vào Sổ địa chỉ nếu chưa có
    saveAddressIfNew(form)

    setError('')
    setSubmitting(true)
    try {
      const shippingPayload = {
        ...form,
        city: form.city ? `${form.district ? form.district + ', ' : ''}${form.city}` : form.district || '',
      }

      // 1. Luồng Cổng VNPAY
      if (payment === 'vnpay' && IS_BACKEND) {
        const orderPayload = {
          items: items.map((i) => ({
            productId: i.productId || i.id,
            name: i.name,
            price: i.price,
            color: i.color,
            size: i.size,
            quantity: i.quantity,
            image: i.image,
          })),
          shipping_info: shippingPayload,
          shipping: shippingPayload,
          payment_method: 'vnpay',
          paymentMethod: 'vnpay',
          voucher_code: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
          voucherCode: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
          total_amount: grandTotal,
          frontend_url: window.location.origin,
        }
        const res = await createPaymentUrl(orderPayload)
        if (res.paymentUrl) {
          // Chỉ xóa giỏ hàng nếu thanh toán từ giỏ thông thường, Mua ngay giữ nguyên đồ cũ
          if (!isBuyNow) {
            clearCart()
          }
          showToast('Đang chuyển hướng tới cổng thanh toán VNPAY...')
          window.location.href = res.paymentUrl
          return
        }
      }

      // 2. Luồng COD hoặc VietQR
      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId || i.id,
          name: i.name,
          price: i.price,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          image: i.image,
        })),
        shipping_info: shippingPayload,
        shipping: shippingPayload,
        payment_method: payment,
        paymentMethod: payment,
        voucher_code: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
        voucherCode: appliedVoucher?.code || appliedVoucher?.voucher?.code || undefined,
        total_amount: grandTotal,
      }

      let newOrderCode = ''
      let newOrderId = null

      if (IS_BACKEND) {
        const res = await createOrder(orderPayload)
        newOrderId = res.id || res.orderId
        newOrderCode = res.code || (res.orderId ? `DH${String(res.orderId).padStart(6, '0')}` : res.id)
      } else {
        newOrderCode = 'DH' + Date.now().toString().slice(-8)
        newOrderId = newOrderCode
        addOrder({
          id: newOrderCode,
          userId: user?.email,
          date: new Date().toISOString(),
          items: items.map(({ productId, name, price, quantity, size, color }) => ({
            productId,
            name,
            price,
            quantity,
            size,
            color,
          })),
          total: grandTotal,
          status: 'pending',
          paymentMethod: payment,
        })
      }

      // Chỉ xóa giỏ hàng nếu thanh toán từ giỏ thông thường, Mua ngay giữ nguyên đồ cũ
      if (!isBuyNow) {
        clearCart()
      }

      // Hiển thị giao diện tương ứng theo phương thức
      if (payment === 'vietqr' || payment === 'bank') {
        setVietQrOrder({
          id: newOrderId,
          code: newOrderCode,
          total: grandTotal,
          shippingInfo: shippingPayload,
        })
        showToast('Tạo đơn hàng thành công! Vui lòng quét mã QR để chuyển khoản.')
      } else {
        setOrderId(newOrderCode)
        showToast('Đặt hàng thành công!')
      }
    } catch (err) {
      const errMsg =
        err.response?.status === 401
          ? 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
          : err.response?.data?.message || 'Không thể đặt hàng lúc này, vui lòng thử lại.'
      setError(errMsg)
      showToast(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  // Giao diện Thanh toán VietQR Động (Luxury redesign)
  if (vietQrOrder) {
    const qrUrl = `https://img.vietqr.io/image/timo-0352294912-compact2.jpg?amount=${vietQrOrder.total}&addInfo=${encodeURIComponent('Thanh toan don hang ' + vietQrOrder.code)}&accountName=${encodeURIComponent('DOAN DUC VUONG')}`
    const transferNote = `Thanh toan don hang ${vietQrOrder.code}`

    const handleCopy = (text, field) => {
      navigator.clipboard?.writeText(text)
      setCopiedField(field)
      showToast(`Đã sao chép: ${text}`)
      setTimeout(() => setCopiedField(''), 2000)
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-14">
        {/* Header thành công */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={36} />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 mb-1">
            Đặt hàng thành công!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Mã đơn hàng: <strong className="font-mono text-stone-900 text-sm">{vietQrOrder.code}</strong> — Trạng thái:{' '}
            <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold text-xs">
              Chờ thanh toán chuyển khoản
            </span>
          </p>
        </div>

        {/* Khung VietQR Card */}
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="bg-blue-50/60 px-6 py-3.5 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-[#1e3a8a]" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-950">
                Quét mã VietQR chuyển khoản nhanh
              </span>
            </div>
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-[#1e3a8a] text-white rounded-full">
              Khuyên dùng
            </span>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
            {/* Ảnh mã QR động */}
            <div className="shrink-0 text-center">
              <div className="p-3 bg-white border border-stone-200 rounded-2xl shadow-sm inline-block">
                <img
                  src={qrUrl}
                  alt="Mã QR chuyển khoản VietQR"
                  className="w-56 h-56 md:w-64 md:h-64 object-contain mx-auto"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-2.5 font-medium">
                Mở App Ngân hàng bất kỳ để quét mã tự động
              </p>
            </div>

            {/* Chi tiết thông tin tài khoản */}
            <div className="flex-1 w-full space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-500 block mb-0.5 text-[11px]">Ngân hàng thụ hưởng:</span>
                <span className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Building2 size={16} className="text-[#1e3a8a]" />
                  {VIETQR_CONFIG.bankName}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <div>
                  <span className="text-stone-500 block mb-0.5 text-[11px]">Số tài khoản:</span>
                  <span className="text-base font-mono font-extrabold text-stone-900 tracking-wider">
                    {VIETQR_CONFIG.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(VIETQR_CONFIG.accountNumber, 'acc')}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-stone-300 rounded-lg bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1 transition-colors shadow-2xs"
                >
                  {copiedField === 'acc' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-stone-500 block mb-0.5 text-[11px]">Tên chủ tài khoản:</span>
                <span className="text-sm font-bold text-stone-900 uppercase">
                  {VIETQR_CONFIG.accountName}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl">
                <div>
                  <span className="text-amber-800 block mb-0.5 text-[11px] font-semibold">
                    Số tiền cần chuyển chính xác:
                  </span>
                  <span className="text-lg font-black text-[#1e3a8a]">
                    {formatCurrency(vietQrOrder.total)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(String(vietQrOrder.total), 'amount')}
                  className="px-2.5 py-1.5 text-xs font-bold border border-amber-300 rounded-lg bg-white hover:bg-amber-100/50 flex items-center gap-1 transition-colors text-amber-900 shadow-2xs"
                >
                  {copiedField === 'amount' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200/70">
                <div className="min-w-0 pr-2">
                  <span className="text-stone-500 block mb-0.5 text-[11px]">Nội dung chuyển khoản (bắt buộc):</span>
                  <span className="text-xs font-mono font-bold text-stone-900 break-all">
                    {transferNote}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(transferNote, 'note')}
                  className="px-2.5 py-1.5 text-xs font-semibold border border-stone-300 rounded-lg bg-white hover:bg-stone-50 text-stone-700 flex items-center gap-1 transition-colors shadow-2xs shrink-0"
                >
                  {copiedField === 'note' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedField === 'note' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hướng dẫn người dùng */}
          <div className="px-6 py-3.5 bg-amber-50/60 border-t border-amber-100 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Hệ thống mã VietQR đã điền sẵn số tiền và mã đơn hàng. Sau khi bạn chuyển khoản thành công, Admin sẽ xác nhận và tiến hành đóng gói giao hàng ngay lập tức.
            </p>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => {
              showToast('Cảm ơn bạn! Đơn hàng đang được Admin xử lý xác nhận.')
              navigate('/profile')
            }}
            className="w-full sm:w-auto px-8 py-3 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 size={16} />
            Tôi đã chuyển khoản thành công
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="w-full sm:w-auto px-6 py-3 border border-stone-300 text-xs sm:text-sm font-semibold rounded-xl bg-white hover:bg-stone-50 text-stone-700 transition-colors"
          >
            Xem lịch sử đơn hàng
          </button>
        </div>
      </div>
    )
  }

  // Giao diện COD thành công
  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm mb-1">Mã đơn hàng của bạn:</p>
        <p className="font-mono text-xl sm:text-2xl font-bold text-[#1e3a8a] mb-6">{orderId}</p>
        <p className="text-xs sm:text-sm text-stone-600 mb-8 max-w-sm mx-auto leading-relaxed">
          Cảm ơn bạn đã lựa chọn Maison. Đơn hàng đang được chuẩn bị và sẽ được giao tới địa chỉ của bạn trong vòng 2-3 ngày làm việc.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
          >
            Xem đơn hàng
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-2.5 border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    )
  }

  // Giỏ hàng trống
  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-stone-400">
          <ShoppingBag size={28} />
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-xs sm:text-sm text-stone-500 mb-6">
          Vui lòng thêm sản phẩm vào giỏ trước khi tiến hành thanh toán đơn hàng.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
        >
          Khám phá sản phẩm
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10 pb-24 lg:pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-stone-500 mb-6">
        <Link to="/" className="hover:text-blue-900 transition-colors">
          Trang chủ
        </Link>
        <ChevronRight size={13} className="text-stone-400 shrink-0" />
        <Link to="/cart" className="hover:text-blue-900 transition-colors">
          Giỏ hàng
        </Link>
        <ChevronRight size={13} className="text-stone-400 shrink-0" />
        <span className="text-stone-900 font-bold">Thanh toán đơn hàng</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Thanh toán
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Vui lòng kiểm tra kỹ thông tin nhận hàng và chọn phương thức thanh toán phù hợp.
          </p>
        </div>
        <Link
          to="/cart"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft size={14} /> Quay lại giỏ hàng
        </Link>
      </div>

      <form onSubmit={handleConfirm}>
        {/* BỐ CỤC 2 CỘT CHUẨN LUXURY MODERN (Desktop: lg:grid-cols-12, Mobile: grid-cols-1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (lg:col-span-7): Form nhận hàng, Vận chuyển, Thanh toán */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Khối Thông tin khách hàng & Địa chỉ */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2 pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-extrabold flex items-center justify-center">
                    1
                  </span>
                  Thông tin nhận hàng
                </h2>

                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <span className="text-sm">📍</span>
                  <span>Chọn từ sổ địa chỉ của bạn</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Họ tên: Dòng riêng biệt */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors text-stone-700 bg-white"
                  />
                </div>

                {/* Số điện thoại: Dòng riêng biệt */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="0912345678"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors text-stone-700 bg-white"
                  />
                </div>

                {/* Địa chỉ nhận hàng: Dòng riêng biệt */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Địa chỉ nhận hàng (Số nhà, tên đường, thôn/xóm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Số 123 đường Lê Lợi, Phường Bến Nghé"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors text-stone-700 bg-white"
                  />
                </div>

                {/* Bố trí Dropdown Tỉnh/Thành - Quận/Huyện trên cùng 1 hàng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Tỉnh / Thành phố <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={form.city}
                      onChange={(e) => {
                        const newCity = e.target.value
                        setForm((prev) => ({ ...prev, city: newCity, district: '' }))
                      }}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors text-stone-700 bg-white"
                    >
                      <option value="">
                        {loadingProvinces && provinces.length === 0
                          ? '-- Đang tải danh sách tỉnh thành... --'
                          : '-- Chọn Tỉnh / Thành phố --'}
                      </option>
                      {provinces.map((p) => (
                        <option key={p.code || p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                      {form.city && !provinces.some((p) => p.name === form.city) && (
                        <option value={form.city}>{form.city}</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Quận / Huyện
                    </label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                      className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors text-stone-700 bg-white"
                    >
                      <option value="">
                        {!form.city
                          ? '-- Vui lòng chọn Tỉnh/Thành trước --'
                          : '-- Chọn Quận / Huyện --'}
                      </option>
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      {form.district && !districts.includes(form.district) && (
                        <option value={form.district}>{form.district}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Ghi chú đơn hàng: Dòng riêng biệt */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Ghi chú đơn hàng (tuỳ chọn)
                  </label>
                  <textarea
                    placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:ring-1 focus:ring-blue-900 focus:border-blue-900 outline-none transition-colors text-stone-700 bg-white resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Phương thức vận chuyển */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-extrabold flex items-center justify-center">
                  2
                </span>
                Phương thức vận chuyển
              </h2>

              <div className="border-2 border-blue-900 bg-blue-50/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-[#1e3a8a] bg-[#1e3a8a] flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <Truck size={20} className="text-[#1e3a8a]" />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 block">
                      Giao hàng tiêu chuẩn tận nơi
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Thời gian nhận hàng dự kiến từ 2-3 ngày làm việc
                    </span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#1e3a8a]">
                  {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                </span>
              </div>
            </div>

            {/* 3. Phương thức thanh toán (Dạng Cards bo góc có trạng thái Active) */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <h2 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-[#1e3a8a] text-xs font-extrabold flex items-center justify-center">
                  3
                </span>
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => {
                  const isSelected = payment === m.id
                  return (
                    <label
                      key={m.id}
                      onClick={() => setPayment(m.id)}
                      className={`flex items-start gap-3.5 rounded-xl p-4 cursor-pointer transition-all border ${
                        isSelected
                          ? 'border-2 border-[#1e3a8a] bg-blue-50/30 shadow-2xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      {/* Dấu chấm radio tuỳ chỉnh */}
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'border-[#1e3a8a] bg-[#1e3a8a]'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>

                      <m.icon
                        size={20}
                        className={isSelected ? 'text-[#1e3a8a] shrink-0' : 'text-stone-500 shrink-0'}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isSelected ? 'text-blue-950' : 'text-stone-900'
                            }`}
                          >
                            {m.label}
                          </span>
                          {m.badge && (
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isSelected
                                  ? 'bg-[#1e3a8a] text-white'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {m.badge}
                            </span>
                          )}
                        </div>
                        {m.desc && (
                          <p className="text-xs text-stone-500 mt-1 leading-relaxed">{m.desc}</p>
                        )}
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* Cam kết bảo mật */}
              <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Thông tin thanh toán của bạn được mã hóa an toàn và bảo mật theo tiêu chuẩn SSL 256-bit.
                </span>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (lg:col-span-5): Giỏ hàng, Voucher, Chi phí (Sticky top-24) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
              {/* Header giỏ hàng */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#1e3a8a]" />
                    Đơn hàng ({items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)} sản phẩm)
                  </h2>
                  {isBuyNow && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Sparkles size={11} className="text-amber-600" /> Luồng Mua ngay (Độc lập với giỏ hàng)
                    </span>
                  )}
                </div>
                {!isBuyNow && (
                  <Link
                    to="/cart"
                    className="text-xs text-[#1e3a8a] font-semibold hover:underline"
                  >
                    Sửa giỏ hàng
                  </Link>
                )}
              </div>

              {/* Thanh Progress Bar Freeship */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  {totalPrice >= 500000 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Sparkles size={13} className="text-emerald-600" />
                      Đơn hàng đã được MIỄN PHÍ VẬN CHUYỂN!
                    </span>
                  ) : (
                    <span className="text-stone-700">
                      Mua thêm <strong className="text-[#1e3a8a]">{formatCurrency(remainingForFreeship)}</strong> để Freeship
                    </span>
                  )}
                  <span className="font-mono text-stone-400 text-[11px]">{freeshipProgress}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalPrice >= 500000 ? 'bg-emerald-500' : 'bg-[#1e3a8a]'
                    }`}
                    style={{ width: `${freeshipProgress}%` }}
                  />
                </div>
              </div>

              {/* Danh sách sản phẩm thu nhỏ */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                {items.map((item) => {
                  const key = lineKey(item)
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-stone-100 hover:border-stone-200 bg-stone-50/50 transition-colors"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-14 object-cover rounded-lg bg-stone-200 shrink-0 border border-stone-200"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-bold text-stone-900 truncate mb-0.5" title={item.name}>
                          {item.name}
                        </p>
                        <div className="text-[11px] text-stone-500 flex items-center gap-2 mb-1.5">
                          <span>Màu: <strong className="text-stone-700 capitalize">{item.color}</strong></span>
                          <span>•</span>
                          <span>Size: <strong className="text-stone-700">{item.size}</strong></span>
                        </div>

                        {/* Bộ đếm số lượng */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-stone-300 rounded-md h-6 bg-white">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item, (Number(item.quantity) || 1) - 1)}
                              className="w-6 h-full flex items-center justify-center text-stone-600 hover:text-stone-900"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-6 text-center font-bold text-xs text-stone-900 select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item, (Number(item.quantity) || 1) + 1)}
                              className="w-6 h-full flex items-center justify-center text-stone-600 hover:text-stone-900"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <span className="font-bold text-stone-900 text-xs">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Nút xóa sản phẩm */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSingleItem(item)}
                        className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                        title="Xóa sản phẩm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Khối Mã giảm giá (Voucher) */}
              <div className="pt-2 border-t border-stone-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Ticket size={14} className="text-[#1e3a8a]" /> Mã giảm giá
                  </label>
                  {appliedVoucher && (
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Đã giảm {formatCurrency(discountAmount)}
                    </span>
                  )}
                </div>

                {appliedVoucher ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Tag size={15} className="text-emerald-700" />
                      <div>
                        <p className="text-xs font-bold text-emerald-800 uppercase">
                          {appliedVoucher.code || appliedVoucher.voucher?.code} (-{formatCurrency(discountAmount)})
                        </p>
                        <p className="text-[10px] text-emerald-600">Đã áp dụng giảm giá trực tiếp vào đơn hàng</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                      title="Gỡ bỏ mã"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã ưu đãi..."
                        className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs uppercase outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 placeholder:normal-case font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher()}
                        disabled={applyingVoucher || !voucherInput.trim()}
                        className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 shrink-0"
                      >
                        {applyingVoucher ? '...' : 'Áp dụng'}
                      </button>
                    </div>

                    {voucherError && (
                      <p className="text-xs text-rose-600 font-medium">{voucherError}</p>
                    )}

                    {/* Dải scroll ngang chứa các thẻ Voucher có viền đứt nét */}
                    <div className="pt-1">
                      <p className="text-[11px] text-stone-400 mb-1.5">Gợi ý mã ưu đãi có thể dùng:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {QUICK_VOUCHERS.map((v) => (
                          <button
                            key={v.code}
                            type="button"
                            onClick={() => handleApplyVoucher(v.code)}
                            className="border border-dashed border-blue-900/60 bg-blue-50/50 hover:bg-blue-100/70 text-blue-950 rounded-lg px-2.5 py-1.5 text-xs font-semibold shrink-0 text-left transition-all active:scale-95"
                          >
                            <span className="font-bold block leading-none">{v.label}</span>
                            <span className="text-[10px] text-stone-500 font-normal">{v.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Tóm tắt chi phí đơn hàng */}
              <div className="border-t border-stone-100 pt-3 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-500">
                  <span>Tạm tính</span>
                  <span className="text-stone-800 font-medium">{formatCurrency(totalPrice)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Tag size={13} /> Giảm giá voucher
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-500">
                  <span>Phí vận chuyển</span>
                  <span className="text-stone-800 font-medium">
                    {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-3 border-t border-stone-200">
                  <span className="text-sm font-bold text-stone-900">Tổng thanh toán</span>
                  <span className="text-xl sm:text-2xl font-black text-[#1e3a8a] tracking-tight">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

              {/* Nút Đặt hàng trên Desktop */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {submitting ? (
                  'Đang xử lý đơn hàng...'
                ) : payment === 'vnpay' ? (
                  <>
                    <CreditCard size={17} />
                    Thanh toán VNPAY ({formatCurrency(grandTotal)})
                  </>
                ) : payment === 'vietqr' ? (
                  <>
                    <QrCode size={17} />
                    Lấy mã VietQR thanh toán ({formatCurrency(grandTotal)})
                  </>
                ) : (
                  <>
                    <Truck size={17} />
                    Xác nhận đặt hàng COD ({formatCurrency(grandTotal)})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4. THANH STICKY BOTTOM (DÀNH CHO MOBILE/TABLET) */}
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3.5 lg:hidden z-30 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-stone-500 truncate">
                {payment === 'vietqr' ? (
                  <>
                    <QrCode size={14} className="text-[#1e3a8a] shrink-0" />
                    <span className="font-semibold text-stone-800 truncate">VietQR</span>
                  </>
                ) : payment === 'vnpay' ? (
                  <>
                    <CreditCard size={14} className="text-[#1e3a8a] shrink-0" />
                    <span className="font-semibold text-stone-800 truncate">VNPAY</span>
                  </>
                ) : (
                  <>
                    <Truck size={14} className="text-[#1e3a8a] shrink-0" />
                    <span className="font-semibold text-stone-800 truncate">COD</span>
                  </>
                )}
              </div>
              <div className="text-base font-extrabold text-[#1e3a8a] tracking-tight">
                {formatCurrency(grandTotal)}
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
            >
              {submitting ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
          </div>
        </div>

        {/* Modal Chọn địa chỉ đã lưu */}
        {showAddressModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] flex flex-col">
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <h3 className="text-base font-bold text-stone-900">
                    Sổ địa chỉ nhận hàng của bạn
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Đóng"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Danh sách thẻ địa chỉ */}
              <div className="overflow-y-auto flex-1 pr-1">
                {getSavedAddresses().map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="border border-stone-200 rounded-xl p-4 mb-4 hover:border-blue-500 transition-colors cursor-pointer group bg-stone-50/20 hover:bg-white"
                  >
                    {/* Dòng 1: In đậm Tên + SĐT, badge Mặc định */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900">
                          {addr.recipientName || addr.fullName || 'Khách hàng'}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="font-bold text-sm text-stone-900 font-mono">
                          {addr.phone}
                        </span>
                      </div>
                      {addr.isDefault && (
                        <span className="bg-yellow-400 text-xs px-2 py-1 rounded font-semibold text-stone-900 shrink-0">
                          Mặc định
                        </span>
                      )}
                    </div>

                    {/* Dòng 2: Text địa chỉ chi tiết màu xám */}
                    <p className="text-xs text-stone-500 leading-relaxed mb-3">
                      {[addr.address, addr.district, addr.city].filter(Boolean).join(', ')}
                    </p>

                    {/* Dòng 3: Nút text căn phải */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectSavedAddress(addr)
                        }}
                        className="text-blue-700 font-medium text-xs hover:underline cursor-pointer"
                      >
                        Sử dụng địa chỉ này →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cuối Modal */}
              <div className="mt-2 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span>Quản lý thêm tại trang Hồ sơ cá nhân</span>
                <Link
                  to="/profile"
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Đến Sổ địa chỉ →
                </Link>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
