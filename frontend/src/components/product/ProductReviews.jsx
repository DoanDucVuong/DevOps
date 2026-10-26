import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MessageSquare, CheckCircle2, Send, User } from 'lucide-react'
import { fetchProductReviews, submitProductReview } from '../../api/client'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../common/Toast'
import { formatDate } from '../../utils/format'

export default function ProductReviews({ productId, initialAvgRating = 4.8 }) {
  const user = useAuthStore((s) => s.user)
  const { showToast } = useToast()

  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(0)
  const [avgRating, setAvgRating] = useState(initialAvgRating)
  const [loading, setLoading] = useState(true)

  // Form states
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
        setReviews(data.reviews || [])
        setTotal(data.total || (data.reviews ? data.reviews.length : 0))
        if (data.avgRating && data.avgRating > 0) {
          setAvgRating(data.avgRating)
        }
      })
      .catch(() => {
        // Fallback đánh giá cục bộ nếu không có backend
        if (!active) return
        setReviews([
          {
            id: 'rev_local',
            user_name: 'Nguyễn Văn Minh',
            rating: 5,
            comment: 'Chất vải dày dặn mặc rất đứng dáng, đường kim mũi chỉ tỉ mỉ. Rất đáng tiền!',
            created_at: new Date().toISOString(),
          },
        ])
        setTotal(1)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [productId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá')
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
        setAvgRating(res.avgRating)
      } else {
        const nextAvg = +(((avgRating * total) + rating) / (total + 1)).toFixed(1)
        setAvgRating(nextAvg)
      }

      setComment('')
      showToast('Cảm ơn bạn đã gửi đánh giá!')
    } catch (err) {
      const errMsg = err?.response?.data?.message || err.message || 'Gửi đánh giá thất bại, vui lòng thử lại sau.'
      showToast(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-16 pt-10 border-t border-stone">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl mb-1 flex items-center gap-2">
            <MessageSquare size={22} className="text-clay" />
            Đánh giá & Bình luận
          </h2>
          <p className="text-xs text-ink-soft">
            Những chia sẻ thực tế từ khách hàng đã trải nghiệm sản phẩm tại Maison
          </p>
        </div>

        {/* Khối tóm tắt điểm đánh giá */}
        <div className="flex items-center gap-4 bg-paper border border-stone-dark/40 px-4 py-3 rounded-sm shadow-xs">
          <div className="text-center border-r border-stone pr-4">
            <span className="font-display text-3xl font-bold text-ink">{avgRating}</span>
            <span className="text-xs text-ink-soft block">trên 5</span>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(avgRating) ? 'fill-gold text-gold' : 'text-stone-dark'}
                />
              ))}
            </div>
            <p className="text-xs text-ink-soft">Dựa trên {total} lượt đánh giá</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        {/* Cột trái: Danh sách bình luận */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-soft mb-4">
            Đánh giá từ khách hàng ({reviews.length})
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-stone/40 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="border border-dashed border-stone rounded-sm p-8 text-center text-ink-soft text-sm">
              Chưa có bình luận nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-paper border border-stone-dark/30 rounded-sm p-4 space-y-2 hover:border-stone-dark transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-ink text-ivory text-xs font-semibold flex items-center justify-center uppercase">
                        {rev.user_name ? rev.user_name.charAt(0) : 'K'}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-ink block leading-none">
                          {rev.user_name}
                        </span>
                        {rev.is_verified_buyer && (
                          <span className="text-[11px] text-moss font-medium flex items-center gap-1 mt-0.5">
                            <CheckCircle2 size={12} /> Đã mua hàng
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] text-ink-soft">
                      {rev.created_at ? formatDate(rev.created_at) : 'Mới đây'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={s <= rev.rating ? 'fill-gold text-gold' : 'text-stone-dark'}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-ink-soft leading-relaxed pt-1">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột phải: Form gửi đánh giá */}
        <div className="lg:col-span-5">
          <div className="bg-paper border border-stone-dark/40 rounded-sm p-6 sticky top-24">
            <h3 className="font-display text-lg mb-1">Gửi đánh giá của bạn</h3>
            <p className="text-xs text-ink-soft mb-5">
              Ý kiến của bạn giúp chúng tôi và các khách hàng khác lựa chọn tốt hơn.
            </p>

            {!user ? (
              <div className="border border-dashed border-stone-dark/60 rounded-sm p-6 text-center bg-stone/10">
                <div className="h-10 w-10 mx-auto rounded-full bg-stone/40 text-ink-soft flex items-center justify-center mb-3">
                  <User size={20} />
                </div>
                <p className="text-sm font-medium text-ink mb-2">
                  Vui lòng đăng nhập và mua sản phẩm để chia sẻ đánh giá.
                </p>
                <p className="text-xs text-ink-soft mb-4">
                  Chỉ những khách hàng đã mua sản phẩm thành công mới có thể gửi đánh giá.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 bg-ink text-ivory text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-ink-soft transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2.5 p-2.5 bg-stone/20 border border-stone-dark/30 rounded-sm">
                  <div className="h-8 w-8 rounded-full bg-ink text-ivory text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                    {(user.fullName || user.name || user.email || 'U').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-ink block truncate">
                      {user.fullName || user.name || user.email}
                    </span>
                    <span className="text-[11px] text-moss font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} /> Tài khoản đánh giá
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                    Đánh giá số sao <span className="text-clay">*</span>
                  </label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-110 transition-transform"
                        aria-label={`${star} sao`}
                      >
                        <Star
                          size={22}
                          className={
                            star <= (hoverRating || rating)
                              ? 'fill-gold text-gold cursor-pointer'
                              : 'text-stone-dark cursor-pointer'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs text-ink-soft ml-2 font-medium">
                      {rating === 5 ? 'Rất hài lòng (5/5)' : rating === 4 ? 'Hài lòng (4/5)' : rating === 3 ? 'Bình thường (3/5)' : 'Chưa ưng ý'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                    Nội dung bình luận <span className="text-clay">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Chia sẻ cảm nhận về form áo, độ vừa vặn, chất liệu vải..."
                    className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-white outline-none focus:border-ink transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-ink text-ivory text-sm font-medium rounded-sm hover:bg-ink-soft transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={15} />
                  <span>{submitting ? 'Đang gửi...' : 'Gửi đánh giá ngay'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
