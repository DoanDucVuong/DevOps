import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-28 text-center">
      <p className="font-display text-8xl md:text-9xl text-stone-dark leading-none">404</p>
      <h1 className="font-display text-2xl md:text-3xl mt-4 mb-3">Không tìm thấy trang này</h1>
      <p className="text-ink-soft text-sm max-w-sm mx-auto mb-8">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển. Hãy quay lại trang chủ để tiếp tục mua sắm.
      </p>
      <Link to="/" className="inline-block px-6 py-3 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors">
        Về trang chủ
      </Link>
    </div>
  )
}
