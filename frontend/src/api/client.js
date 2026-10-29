import axios from 'axios'

let rawUrl = import.meta.env.VITE_API_URL

// Tự động nhận diện môi trường:
// - Nếu chạy dev cục bộ (npm run dev, port 5173/3000): mặc định http://localhost:4000/api
// - Nếu chạy trong Docker/Production (truy cập qua IP hoặc domain): dùng relative '/api' qua Nginx proxy
if (typeof window !== 'undefined') {
  const isLocalDev = window.location.port === '5173' || window.location.port === '3000'
  if (!isLocalDev && (!rawUrl || rawUrl.includes('localhost') || rawUrl.includes('127.0.0.1') || rawUrl.includes(':4000'))) {
    rawUrl = '/api'
  }
}

if (rawUrl) {
  if (!rawUrl.startsWith('/') && !rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl
  }
  try {
    const parsed = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
    if (parsed.hostname === 'sttn-backend') {
      parsed.hostname = 'sttn-backend.onrender.com'
      rawUrl = parsed.toString()
    }
  } catch (e) {
    // fallback
  }
  if (!rawUrl.endsWith('/api') && !rawUrl.startsWith('/api')) {
    rawUrl = rawUrl.replace(/\/+$/, '') + '/api'
  }
}

export const IS_BACKEND = true

export const api = axios.create({
  baseURL: rawUrl || '/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('sttn-token')
  let role = 'customer'
  try {
    const auth = JSON.parse(localStorage.getItem('auth-storage') || '{}')
    if (auth?.state?.token && !token) {
      token = auth.state.token
      localStorage.setItem('sttn-token', token)
    }
    if (auth?.state?.user?.role) {
      role = auth.state.user.role
    }
  } catch (e) {}

  if (token) config.headers.Authorization = `Bearer ${token}`
  if (role === 'admin') {
    config.headers['x-admin-role'] = 'admin'
  }

  // Đảm bảo dữ liệu luôn thời gian thực (Real-time), chống cache cũ
  config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
  config.headers['Pragma'] = 'no-cache'
  config.headers['Expires'] = '0'

  if (config.method === 'get') {
    config.params = { _t: Date.now(), ...(config.params || {}) }
  }
  return config
})

const noBackend = () => Promise.reject(new Error('no-backend'))
const data = (r) => r.data

// ---- Products ----
export const fetchProducts = (params) => (IS_BACKEND ? api.get('/products', { params }).then(data) : noBackend())
export const fetchProductById = (id) => (IS_BACKEND ? api.get(`/products/${id}`).then(data) : noBackend())
export const fetchSimilarProducts = (id, topK = 4) =>
  IS_BACKEND ? api.get(`/products/${id}/similar`, { params: { top_k: topK } }).then(data) : noBackend()
export const fetchProductReviews = (id) =>
  IS_BACKEND ? api.get(`/products/${id}/reviews`).then(data) : Promise.resolve({ reviews: [], total: 0, avgRating: 5 })
export const submitProductReview = (id, payload) =>
  api.post(`/products/${id}/reviews`, payload).then(data)

// ---- Recommendations (ML) ----
export const fetchRecommendations = (userId, topK = 8) => {
  if (!IS_BACKEND) return noBackend()
  const endpoint = userId ? `/recommendations/${encodeURIComponent(userId)}` : '/recommendations'
  return api.get(endpoint, { params: { top_k: topK } }).then(data)
}
export const trackRecommendationClick = (userId, productId) =>
  IS_BACKEND ? api.post('/recommendations/click', { userId, productId }).catch(() => {}) : Promise.resolve()

// ---- Interactions (dữ liệu huấn luyện ML) — "best effort", không chặn trải nghiệm mua sắm ----
export const recordInteraction = (productId, type, ratingValue) =>
  IS_BACKEND ? api.post('/interactions', { productId, type, ratingValue }).catch(() => {}) : Promise.resolve()

// ---- Auth ----
export const registerUser = (payload) => api.post('/auth/register', payload).then(data)
export const loginUser = (payload) => api.post('/auth/login', payload).then(data)
export const fetchCurrentUser = () => api.get('/auth/me').then(data)
export const updateUserProfile = (payload) => api.put('/auth/profile', payload).then(data)

// ---- Orders ----
// Chuẩn hoá về cùng một hình dạng với đơn hàng lưu cục bộ: { id, date, items, total, status }
const normalizeOrder = (o) => ({
  id: o.code, date: o.createdAt, items: o.items, total: o.total, status: o.status,
  shipping: o.shipping, paymentMethod: o.paymentMethod,
  customerName: o.customerName, customerEmail: o.customerEmail, numericId: o.id,
})
export const createOrder = (payload) => api.post('/orders', payload).then(data)
export const createPaymentUrl = (payload) => api.post('/orders/create_payment_url', payload).then(data)
export const fetchMyOrders = () => api.get('/orders/me').then((r) => r.data.map(normalizeOrder))

// ---- Admin ----
export const fetchAdminDashboard = () => api.get('/admin/dashboard').then(data)
export const fetchAdminOrders = () => api.get('/admin/orders').then((r) => r.data.map(normalizeOrder))
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status }).then(data)
export const fetchMlStatus = () => api.get('/admin/ml/status').then(data)
export const triggerRetrain = () => api.post('/admin/ml/retrain').then(data)
export const fetchAdminProducts = (params) => api.get('/admin/products', { params }).then(data)
export const createAdminProduct = (payload) => api.post('/admin/products', payload).then(data)
export const updateAdminProduct = (id, payload) => api.put(`/admin/products/${id}`, payload).then(data)
export const deleteAdminProduct = (id) => api.delete(`/admin/products/${id}`).then(data)

// ---- Categories ----
export const fetchCategories = () => api.get('/categories').then(data).catch(() => null)
export const fetchAdminCategories = () => api.get('/categories/admin').then(data)
export const createCategory = (payload) => api.post('/categories/admin', payload).then(data)
export const updateCategory = (id, payload) => api.put(`/categories/admin/${id}`, payload).then(data)
export const deleteCategory = (id) => api.delete(`/categories/admin/${id}`).then(data)
export const createAdminCategory = createCategory
export const updateAdminCategory = updateCategory
export const deleteAdminCategory = deleteCategory

// ---- Vouchers ----
export const applyVoucher = (code, order_total) =>
  api.post('/vouchers/apply', { code, order_total }).then((r) => {
    const d = r.data
    return {
      ...d,
      discountAmount: Number(d.discount_amount || d.discountAmount || 0),
    }
  })
export const fetchAdminVouchers = () => api.get('/vouchers/admin').then(data)
export const createVoucher = (payload) => api.post('/vouchers/admin', payload).then(data)
export const updateVoucher = (id, payload) => api.put(`/vouchers/admin/${id}`, payload).then(data)
export const deleteVoucher = (id) => api.delete(`/vouchers/admin/${id}`).then(data)
export const createAdminVoucher = createVoucher
export const updateAdminVoucher = updateVoucher
export const deleteAdminVoucher = deleteVoucher

// ---- Banners ----
export const fetchBanners = () => api.get('/banners').then(data).catch(() => null)
export const fetchAdminBanners = () => api.get('/banners/admin').then(data)
export const createBanner = (payload) => api.post('/banners/admin', payload).then(data)
export const updateBanner = (id, payload) => api.put(`/banners/admin/${id}`, payload).then(data)
export const deleteBanner = (id) => api.delete(`/banners/admin/${id}`).then(data)
export const updateAdminBanner = updateBanner

export default api
