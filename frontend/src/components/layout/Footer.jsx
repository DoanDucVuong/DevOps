import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-2xl mb-3">Maison.</p>
          <p className="text-sm text-ivory/60 leading-relaxed">
            Thời trang tối giản, chất liệu chọn lọc, dành cho những người yêu sự tinh tế mỗi ngày.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium mb-3">Mua sắm</p>
          <ul className="space-y-2 text-sm text-ivory/60">
            <li><Link to="/products" className="hover:text-ivory">Tất cả sản phẩm</Link></li>
            <li><Link to="/products?category=ao-khoac" className="hover:text-ivory">Áo khoác</Link></li>
            <li><Link to="/products?category=vay" className="hover:text-ivory">Váy & Đầm</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium mb-3">Tài khoản</p>
          <ul className="space-y-2 text-sm text-ivory/60">
            <li><Link to="/login" className="hover:text-ivory">Đăng nhập</Link></li>
            <li><Link to="/orders" className="hover:text-ivory">Lịch sử đơn hàng</Link></li>
            <li><Link to="/wishlist" className="hover:text-ivory">Yêu thích</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium mb-3">Liên hệ</p>
          <ul className="space-y-2 text-sm text-ivory/60">
            <li>hello@maison.vn</li>
            <li>1900 0000</li>
            <li>Đà Nẵng, Việt Nam</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/40">
        © 2026 Maison. Dự án demo Frontend — không có giao dịch thật.
      </div>
    </footer>
  )
}
