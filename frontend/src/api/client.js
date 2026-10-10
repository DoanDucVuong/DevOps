import axios from 'axios'

// Có VITE_API_URL -> chạy với Backend thật. Không có -> frontend độc lập (mock/LocalStorage),
// mọi hàm gọi API bên dưới sẽ KHÔNG phát request nào để tránh lỗi mạng vô ích.
export const IS_BACKEND = Boolean(import.meta.env.VITE_API_URL)

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
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
