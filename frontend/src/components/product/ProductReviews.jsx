import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Send,
  User,
  PenLine,
  ThumbsUp,
  Filter,
  Sparkles,
  X,
} from 'lucide-react'
import { fetchProductReviews, submitProductReview } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../common/Toast'
import { formatDate } from '../../utils/format'

export default function ProductReviews({ productId, initialAvgRating = 0 }) {
  const user = useAuthStore((s) => s.user)
  const { showToast } = useToast()

  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [avgRating, setAvgRating] = useState(Number(initialAvgRating) || 0)
  const [loading, setLoading] = useState(true)

  // Filter & Form toggle states
  const [selectedFilter, setSelectedFilter] = useState('all') // 'all' | 5 | 4 | 3 | 2 | 1
  const [showForm, setShowForm] = useState(false)
  const [likedReviews, setLikedReviews] = useState([])

  // Form input states
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Tải danh sách đánh giá từ API
  useEffect(() => {
    let active = true
    setLoading(true)
    fetchProductReviews(productId)
      .then((data) => {
        if (!active) return
        const revList = data?.reviews || []
        const count = Number(data?.total ?? revList.length)
        setReviews(revList)
        setTotal(count)
        if (count > 0 && data?.avgRating && Number(data.avgRating) > 0) {
          setAvgRating(Number(data.avgRating))
        } else {
          setAvgRating(0)
        }
      })
      .catch(() => {
        if (!active) return
        setReviews([])
        setTotal(0)
        setAvgRating(0)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [productId])

  // Thống kê phân bố sao
  const starCounts = {
    5: reviews.filter((r) => Math.round(Number(r.rating || 0)) === 5).length,
    4: reviews.filter((r) => Math.round(Number(r.rating || 0)) === 4).length,
    3: reviews.filter((r) => Math.round(Number(r.rating || 0)) === 3).length,
    2: reviews.filter((r) => Math.round(Number(r.rating || 0)) === 2).length,
    1: reviews.filter((r) => Math.round(Number(r.rating || 0)) === 1).length,
  }

  // Danh sách review sau khi áp dụng filter
  const filteredReviews =
    selectedFilter === 'all'
      ? reviews
      : reviews.filter((r) => Math.round(Number(r.rating || 0)) === Number(selectedFilter))

  const handleLikeReview = (revId) => {
    setLikedReviews((prev) =>
      prev.includes(revId) ? prev.filter((id) => id !== revId) : [...prev, revId]
    )
    showToast('Cảm ơn bạn đã phản hồi đánh giá này!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá của bạn')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        rating,
        comment: comment.trim(),
      }
      const res = await submitProductReview(productId, payload)

      const newReview = {
        id: Date.now(),
        product_id: productId,
        user_name: user?.fullName || user?.name || user?.email || 'Bạn',
        rating,
        comment: comment.trim(),
        is_verified_buyer: true,
        created_at: new Date().toISOString(),
      }

      setReviews((prev) => [newReview, ...prev])
      setTotal((t) => t + 1)
      if (res?.avgRating) {
        setAvgRating(Number(res.avgRating))
      } else {
        const nextAvg = +((avgRating * total + rating) / (total + 1)).toFixed(1)
        setAvgRating(nextAvg)
      }

      setComment('')
      setShowForm(false)
      showToast('Cảm ơn bạn đã gửi đánh giá cho sản phẩm!')
    } catch (err) {
      const errMsg =
        err?.response?.data?.message || err.message || 'Gửi đánh giá thất bại, vui lòng thử lại sau.'
      showToast(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const getRatingLabel = (val) => {
    switch (val) {
      case 5:
        return 'Rất hài lòng (5/5) - Sản phẩm tuyệt vời'
      case 4:
        return 'Hài lòng (4/5) - Đúng mô tả'
      case 3:
        return 'Bình thường (3/5) - Tạm ổn'
      case 2:
        return 'Chưa ưng ý (2/5) - Cần cải thiện'
      case 1:
        return 'Rất không hài lòng (1/5)'
      default:
        return ''
    }
  }

  return (
    <section className="mt-12 bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
      {/* 1. Header Tiêu đề & Giới thiệu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
              <MessageSquare size={18} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Đánh giá & Bình luận
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Những chia sẻ thực tế từ khách hàng đã trải nghiệm sản phẩm tại Maison
          </p>
        </div>
      </div>

      {/* 2. Khối tổng quan tóm tắt điểm & Thống kê sao (Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 sm:p-6 rounded-xl bg-stone-50/70 border border-stone-200/70 mb-6">
        {/* Cột 1: Điểm trung bình */}
        <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left md:border-r md:border-stone-200/80 md:pr-6">
          {total > 0 ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight">
                  {Number(avgRating || 0).toFixed(1)}
                </span>
                <span className="text-stone-400 text-sm font-semibold">/ 5.0</span>
              </div>
              <div className="flex items-center gap-1 my-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={17}
                    className={
                      star <= Math.round(avgRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-stone-300'
                    }
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Dựa trên <strong>{total}</strong> lượt đánh giá thực tế
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                <Sparkles size={13} className="text-amber-500" /> Chưa có đánh giá
              </div>
              <div className="flex items-center gap-1 my-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={17} className="text-stone-200 fill-stone-100" />
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-1 max-w-xs">
                Sản phẩm chưa có phản hồi. Hãy trở thành người đầu tiên chia sẻ cảm nhận!
              </p>
            </>
          )}
        </div>

        {/* Cột 2: Thanh tiến trình phân bố số sao (Interactive) */}
        <div className="md:col-span-5 space-y-1.5">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = starCounts[s] || 0
            const percent = total > 0 ? Math.round((count / total) * 100) : 0
            const isCurrent = selectedFilter === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedFilter(selectedFilter === s ? 'all' : s)}
                className={`flex items-center gap-2 text-xs group w-full px-2 py-1 rounded-md transition-colors ${
                  isCurrent ? 'bg-amber-100/60 font-semibold' : 'hover:bg-stone-100/80 text-stone-600'
                }`}
                title={`Lọc theo ${s} sao (${count} đánh giá)`}
              >
                <span className="w-11 text-left font-medium flex items-center gap-1 shrink-0">
                  {s} <Star size={12} className="fill-amber-400 text-amber-400" />
                </span>
                <div className="flex-1 h-2 bg-stone-200/70 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-9 text-right text-stone-400 text-[11px] shrink-0 font-mono">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cột 3: Nút kêu gọi hành động Viết đánh giá */}
        <div className="md:col-span-3 flex flex-col items-center md:items-end justify-center md:border-l md:border-stone-200/80 md:pl-6">
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            {showForm ? (
              <>
                <X size={15} /> Đóng biểu mẫu
              </>
            ) : (
              <>
                <PenLine size={15} /> Viết đánh giá
              </>
            )}
          </button>
          <span className="text-[11px] text-stone-400 mt-2 text-center md:text-right">
            Dành cho khách hàng đã mua sản phẩm
          </span>
        </div>
      </div>

      {/* 3. Form gửi đánh giá (Hiển thị khi người dùng bấm "Viết đánh giá") */}
      {showForm && (
        <div className="mb-8 p-5 sm:p-6 rounded-xl bg-gradient-to-br from-blue-50/40 via-white to-stone-50 border border-blue-200/70 shadow-xs transition-all">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Gửi đánh giá của bạn</h3>
              <p className="text-xs text-stone-500">
                Chia sẻ ý kiến chân thực để giúp cộng đồng khách hàng đưa ra lựa chọn phù hợp.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {!user ? (
            <div className="border border-dashed border-stone-300 rounded-xl p-6 text-center bg-stone-50/60">
              <div className="h-10 w-10 mx-auto rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mb-3">
                <User size={18} />
              </div>
              <p className="text-sm font-bold text-stone-900 mb-1">
                Vui lòng đăng nhập để gửi đánh giá
              </p>
              <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
                Chỉ những khách hàng đã đăng nhập và mua sản phẩm thành công tại Maison mới có thể gửi nhận xét.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-blue-800 transition-colors shadow-xs"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Thông tin tài khoản người dùng */}
              <div className="flex items-center gap-3 p-3 bg-white border border-stone-200 rounded-lg">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-700 text-white text-xs font-bold flex items-center justify-center uppercase shrink-0 shadow-xs">
                  {(user.fullName || user.name || user.email || 'U').charAt(0)}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-stone-900 block truncate">
                    {user.fullName || user.name || user.email}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Tài khoản mua hàng chính thức
                  </span>
                </div>
              </div>

              {/* Chọn số sao */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Đánh giá số sao <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 py-1 flex-wrap">
                  <div className="flex items-center gap-1 bg-white border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-125 transition-transform"
                        aria-label={`${star} sao`}
                      >
                        <Star
                          size={24}
                          className={
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400 cursor-pointer drop-shadow-xs'
                              : 'text-stone-300 cursor-pointer'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-stone-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-lg">
                    {getRatingLabel(hoverRating || rating)}
                  </span>
                </div>
              </div>

              {/* Nhập nội dung bình luận */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Nội dung nhận xét <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-stone-400">{comment.length}/500 ký tự</span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Hãy chia sẻ cảm nhận về form áo, độ vừa vặn, chất liệu vải và trải nghiệm nhận hàng để giúp mọi người lựa chọn tốt hơn nhé..."
                  className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm bg-white outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 transition-colors resize-none placeholder:text-stone-400 text-stone-800"
                />
              </div>

              {/* Nút gửi form */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 active:scale-[0.99]"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Đang gửi...' : 'Gửi đánh giá ngay'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 4. Bộ lọc đánh giá theo số sao (Filter Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none flex-wrap border-b border-stone-100">
        <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1 shrink-0">
          <Filter size={13} /> Lọc đánh giá:
        </span>
        <button
          type="button"
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            selectedFilter === 'all'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          Tất cả ({total})
        </button>
        {[5, 4, 3, 2, 1].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelectedFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 shrink-0 ${
              selectedFilter === s
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>{s} Sao</span>
            <span className="text-[10px] opacity-75">({starCounts[s] || 0})</span>
          </button>
        ))}
      </div>

      {/* 5. Danh sách bình luận thực tế */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          /* Trạng thái chưa có bình luận */
          <div className="border border-stone-200/80 rounded-xl p-8 sm:p-12 text-center bg-stone-50/50">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <MessageSquare size={24} />
            </div>
            <h4 className="text-base font-bold text-stone-900 mb-1">
              {selectedFilter === 'all'
                ? 'Chưa có bình luận nào cho sản phẩm này'
                : `Chưa có đánh giá nào ${selectedFilter} sao`}
            </h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4 leading-relaxed">
              {selectedFilter === 'all'
                ? 'Hãy là người đầu tiên chia sẻ cảm nhận thực tế về chất lượng vải, form áo và trải nghiệm nhận hàng để giúp cộng đồng mua sắm tự tin hơn!'
                : 'Thử chuyển sang bộ lọc "Tất cả" hoặc các mức sao khác để xem thêm đánh giá.'}
            </p>
            {!showForm && selectedFilter === 'all' && (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                <PenLine size={14} /> Viết đánh giá đầu tiên
              </button>
            )}
          </div>
        ) : (
          /* Danh sách các thẻ nhận xét */
          <div className="space-y-3.5">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-stone-200/90 rounded-xl p-4 sm:p-5 hover:border-stone-300 transition-all shadow-2xs space-y-2.5"
              >
                {/* Header nhận xét: Avatar + Tên + Badge mua hàng + Ngày */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-700 text-white font-bold text-sm flex items-center justify-center uppercase shadow-xs shrink-0">
                      {rev.user_name ? rev.user_name.charAt(0) : 'K'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-stone-900">
                          {rev.user_name || 'Khách hàng Maison'}
                        </span>
                        {rev.is_verified_buyer && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} className="text-emerald-600" /> Đã mua hàng
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={13}
                              className={
                                s <= rev.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-stone-400">•</span>
                        <span className="text-[11px] text-stone-400">
                          {rev.created_at ? formatDate(rev.created_at) : 'Gần đây'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nội dung nhận xét */}
                <p className="text-sm text-stone-700 leading-relaxed pl-0 sm:pl-13 pt-1">
                  {rev.comment}
                </p>

                {/* Nút bấm hữu ích */}
                <div className="pl-0 sm:pl-13 pt-1 flex items-center gap-4 text-xs text-stone-400">
                  <button
                    type="button"
                    onClick={() => handleLikeReview(rev.id)}
                    className={`flex items-center gap-1.5 text-xs transition-colors hover:text-blue-900 ${
                      likedReviews.includes(rev.id) ? 'text-blue-900 font-bold' : 'text-stone-500'
                    }`}
                  >
                    <ThumbsUp
                      size={13}
                      className={likedReviews.includes(rev.id) ? 'fill-blue-900 text-blue-900' : ''}
                    />
                    <span>Hữu ích {likedReviews.includes(rev.id) ? '(1)' : ''}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
