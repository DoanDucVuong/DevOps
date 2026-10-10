// Sinh và lưu một guestId ổn định cho khách chưa đăng nhập (Guest — mục 3.2.1 báo cáo).
// ML service sẽ không nhận diện được guestId này trong trainset nên tự động fallback về
// Popularity-based Recommendation (đúng như thiết kế Cold-start trong báo cáo).
export function getEffectiveUserId(user) {
  if (user?.id) return String(user.id)

  let guestId = localStorage.getItem('sttn-guest-id')
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('sttn-guest-id', guestId)
  }
  return guestId
}
