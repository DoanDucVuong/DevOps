import axios from 'axios'

let rawUrl = import.meta.env.VITE_API_URL
if (rawUrl) {
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = 'https://' + rawUrl
  }
  try {
    const parsed = new URL(rawUrl)
    if (parsed.hostname === 'sttn-backend') {
      parsed.hostname = 'sttn-backend.onrender.com'
      rawUrl = parsed.toString()
    }
  } catch (e) {
    // fallback
  }
  if (!rawUrl.endsWith('/api')) {
    rawUrl = rawUrl.replace(/\/+$/, '') + '/api'
  }
}

export const IS_BACKEND = Boolean(rawUrl)

export const api = axios.create({
  baseURL: rawUrl || 'http://localhost:4000/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sttn-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const noBackend = () => Promise.reject(new Error('no-backend'))
const data = (r) => r.data

// ---- Products ----
export const fetchProducts = (params) => (IS_BACKEND ? api.get('/products', { params }).then(data) : noBackend())
export const fetchSimilarProducts = (id, topK = 4) =>
  IS_BACKEND ? api.get(`/products/${id}/similar`, { params: { top_k: topK } }).then(data) : noBackend()

// ---- Recommendations (ML) ----
export const fetchRecommendations = (userId, topK = 8) =>
  IS_BACKEND ? api.get(`/recommendations/${encodeURIComponent(userId)}`, { params: { top_k: topK } }).then(data) : noBackend()
export const trackRecommendationClick = (userId, productId) =>
  IS_BACKEND ? api.post('/recommendations/click', { userId, productId }).catch(() => {}) : Promise.resolve()

// ---- Interactions (dữ liệu huấn luyện ML) — "best effort", không chặn trải nghiệm mua sắm ----
export const recordInteraction = (productId, type, ratingValue) =>
  IS_BACKEND ? api.post('/interactions', { productId, type, ratingValue }).catch(() => {}) : Promise.resolve()

// ---- Auth ----
export const registerUser = (payload) => api.post('/auth/register', payload).then(data)
export const loginUser = (payload) => api.post('/auth/login', payload).then(data)

// ---- Orders ----
// Chuẩn hoá về cùng một hình dạng với đơn hàng lưu cục bộ: { id, date, items, total, status }
const normalizeOrder = (o) => ({
  id: o.code, date: o.createdAt, items: o.items, total: o.total, status: o.status,
  shipping: o.shipping, paymentMethod: o.paymentMethod,
  customerName: o.customerName, customerEmail: o.customerEmail, numericId: o.id,
})
export const createOrder = (payload) => api.post('/orders', payload).then(data)
export const fetchMyOrders = () => api.get('/orders/me').then((r) => r.data.map(normalizeOrder))

// ---- Admin ----
export const fetchAdminDashboard = () => api.get('/admin/dashboard').then(data)
export const fetchAdminOrders = () => api.get('/admin/orders').then((r) => r.data.map(normalizeOrder))
export const updateOrderStatus = (id, status) => api.patch(`/admin/orders/${id}/status`, { status }).then(data)
export const fetchMlStatus = () => api.get('/admin/ml/status').then(data)
export const triggerRetrain = () => api.post('/admin/ml/retrain').then(data)
