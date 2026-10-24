import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  RefreshCw, Brain, LayoutDashboard, Folders, Ticket, Image as ImageIcon,
  Plus, Edit2, Trash2, Check, X, AlertCircle, Eye, EyeOff, Loader2, Sparkles,
  ExternalLink, Package, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react'
import {
  fetchAdminDashboard, fetchAdminOrders, updateOrderStatus, fetchMlStatus, triggerRetrain,
  fetchAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
  fetchAdminVouchers, createAdminVoucher, updateAdminVoucher, deleteAdminVoucher,
  fetchBanners, updateAdminBanner,
  fetchAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct,
} from '../../api/client'
import { statusLabels, paymentLabels } from '../../data/orders'
import { formatCurrency, formatDate } from '../../utils/format'
import { useToast } from '../../components/common/Toast'
import { useCategoryStore } from '../../store/categoryStore'
import { useProductStore } from '../../store/productStore'

const ALGO_LABELS = {
  hybrid: 'Hybrid',
  popularity: 'Popularity',
  content_based: 'Content-based',
  fallback_top_rated: 'Dự phòng (top đánh giá)',
}

function StatCard({ label, value, hint }) {
  return (
    <div className="border border-stone rounded-sm p-5 bg-paper shadow-sm">
      <p className="text-xs text-ink-soft mb-2">{label}</p>
      <p className="font-display text-2xl">{value}</p>
      {hint && <p className="text-xs text-ink-soft mt-1">{hint}</p>}
    </div>
  )
}

function Panel({ title, action, children }) {
  return (
    <section className="border border-stone rounded-sm p-5 bg-paper shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h2 className="font-display text-lg">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Admin() {
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const refreshStoreCategories = useCategoryStore((s) => s.fetchCategories)
  const refreshStoreProducts = useProductStore((s) => s.fetchProducts)
  const syncProductUpdate = useProductStore((s) => s.syncProductUpdate)
  const syncProductDelete = useProductStore((s) => s.syncProductDelete)

  // Determine active tab from URL path
  const getTabFromPath = () => {
    if (location.pathname.includes('/products')) return 'products'
    if (location.pathname.includes('/categories')) return 'categories'
    if (location.pathname.includes('/vouchers')) return 'vouchers'
    if (location.pathname.includes('/banners')) return 'banners'
    return 'dashboard'
  }

  const [activeTab, setActiveTab] = useState(getTabFromPath)
  const [dash, setDash] = useState(null)
  const [orders, setOrders] = useState([])
  const [ml, setMl] = useState(null)
  const [mlError, setMlError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Category management state
  const [categories, setCategories] = useState([])
  const [loadingCats, setLoadingCats] = useState(false)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm] = useState({ id: '', name: '', slug: '', gender_group: 'Chung', image_url: '', sort_order: 0, is_active: true })

  // Voucher management state
  const [vouchers, setVouchers] = useState([])
  const [loadingVouchers, setLoadingVouchers] = useState(false)
  const [voucherModalOpen, setVoucherModalOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState(null)
  const [voucherForm, setVoucherForm] = useState({
    code: '', discount_type: 'percent', discount_value: 10, min_order_value: 0, max_discount: '', usage_limit: '', expires_at: '', is_active: true
  })

  // Banner management state
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(false)
  const [bannerForm, setBannerForm] = useState({
    id: 1, title: '', subtitle: '', description: '', image_url: '', cta_text: '', cta_link: '', is_active: true
  })
  const [savingBanner, setSavingBanner] = useState(false)

  // ==========================================
  // Product management state (CRUD & Drill-down)
  // ==========================================
  const [adminProducts, setAdminProducts] = useState([])
  const [prodTotal, setProdTotal] = useState(0)
  const [prodTotalPages, setProdTotalPages] = useState(1)
  const [prodPage, setProdPage] = useState(1)
  const [prodLimit] = useState(15)
  const [prodSearch, setProdSearch] = useState('')
  const [prodFilterCat, setProdFilterCat] = useState(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('category') || 'all'
  })
  const [prodFilterGender, setProdFilterGender] = useState('all')
  const [loadingProds, setLoadingProds] = useState(false)

  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    id: '', name: '', description: '', category: 'ao-khoac', gender: 'Nam', price: 350000, image_url: '', brand: 'Maison'
  })
  const [savingProduct, setSavingProduct] = useState(false)

  const pollRef = useRef(null)
  const mlWakePollRef = useRef(null)

  // Keep active tab synced with URL
  useEffect(() => {
    setActiveTab(getTabFromPath())
  }, [location.pathname])

  // Sync category filter from URL query when location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const cat = params.get('category')
    if (cat) {
      setProdFilterCat(cat)
      setProdPage(1)
    }
  }, [location.search])

  const switchTab = (tab, queryStr = '') => {
    setActiveTab(tab)
    if (tab === 'dashboard') navigate('/admin')
    else navigate(`/admin/${tab}${queryStr}`)
  }

  // Load Dashboard & Orders
  const loadDashboardData = useCallback(async () => {
    try {
      const [d, o] = await Promise.all([fetchAdminDashboard(), fetchAdminOrders()])
      setDash(d)
      setOrders(o)
      setError('')
    } catch (err) {
      setError(err.response?.status === 403 ? 'Tài khoản không có quyền quản trị.' : 'Không tải được dữ liệu từ Backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load ML Status with Cold-Start Resilience
  const loadMl = useCallback(async () => {
    try {
      const s = await fetchMlStatus()
      setMl(s)
      setMlError('')

      if (s?.status === 'waking_up') {
        if (!mlWakePollRef.current) {
          mlWakePollRef.current = setInterval(async () => {
            try {
              const res = await fetchMlStatus()
              if (res?.status === 'online') {
                clearInterval(mlWakePollRef.current)
                mlWakePollRef.current = null
                setMl(res)
                showToast('Dịch vụ Machine Learning đã sẵn sàng!')
              }
            } catch {
              // keep polling
            }
          }, 4000)
        }
      } else if (mlWakePollRef.current) {
        clearInterval(mlWakePollRef.current)
        mlWakePollRef.current = null
      }
      return s
    } catch {
      setMlError('Không kết nối được ML service. Có thể service đang khởi động trên Render, vui lòng đợi ít phút.')
      return null
    }
  }, [showToast])

  // Load Categories
  const loadCategories = useCallback(async () => {
    setLoadingCats(true)
    try {
      const list = await fetchAdminCategories()
      setCategories(list)
    } catch {
      showToast('Không tải được danh mục')
    } finally {
      setLoadingCats(false)
    }
  }, [showToast])

  // Load Vouchers
  const loadVouchers = useCallback(async () => {
    setLoadingVouchers(true)
    try {
      const list = await fetchAdminVouchers()
      setVouchers(list)
    } catch {
      showToast('Không tải được danh sách mã giảm giá')
    } finally {
      setLoadingVouchers(false)
    }
  }, [showToast])

  // Load Banners
  const loadBanners = useCallback(async () => {
    setLoadingBanners(true)
    try {
      const list = await fetchBanners()
      setBanners(list)
      if (list && list.length > 0) {
        const b = list[0]
        setBannerForm({
          id: b.id,
          title: b.title || '',
          subtitle: b.subtitle || '',
          description: b.description || '',
          image_url: b.image_url || '',
          cta_text: b.cta_text || 'Khám phá ngay',
          cta_link: b.cta_link || '/products',
          is_active: Boolean(b.is_active),
        })
      }
    } catch {
      showToast('Không tải được dữ liệu banner')
    } finally {
      setLoadingBanners(false)
    }
  }, [showToast])

  // Load Admin Products with filtering and pagination
  const loadAdminProducts = useCallback(async () => {
    setLoadingProds(true)
    try {
      const res = await fetchAdminProducts({
        q: prodSearch,
        category: prodFilterCat !== 'all' ? prodFilterCat : undefined,
        gender: prodFilterGender !== 'all' ? prodFilterGender : undefined,
        page: prodPage,
        limit: prodLimit,
      })
      if (res && Array.isArray(res.items)) {
        setAdminProducts(res.items)
        setProdTotal(res.total)
        setProdTotalPages(res.totalPages || 1)
      }
    } catch (err) {
      showToast('Không tải được danh sách sản phẩm')
    } finally {
      setLoadingProds(false)
    }
  }, [prodSearch, prodFilterCat, prodFilterGender, prodPage, prodLimit, showToast])

  // Initial load
  useEffect(() => {
    loadDashboardData()
    loadMl()
    loadCategories()
    loadVouchers()
    loadBanners()

    return () => {
      clearInterval(pollRef.current)
      if (mlWakePollRef.current) clearInterval(mlWakePollRef.current)
    }
  }, [loadDashboardData, loadMl, loadCategories, loadVouchers, loadBanners])

  // Trigger loading products when in products tab or filters change
  useEffect(() => {
    if (activeTab === 'products') {
      loadAdminProducts()
    }
  }, [activeTab, loadAdminProducts])

  // Retrain Trigger
  const handleRetrain = async () => {
    try {
      await triggerRetrain()
      showToast('Đã bắt đầu huấn luyện lại từ dữ liệu thật')
      clearInterval(pollRef.current)
      let ticks = 0
      pollRef.current = setInterval(async () => {
        ticks += 1
        const s = await loadMl()
        if ((s && !s.training.running) || ticks > 60) {
          clearInterval(pollRef.current)
          if (s?.training.error) showToast('Huấn luyện thất bại: ' + s.training.error)
          else if (s) { showToast('Huấn luyện xong, mô hình đã được cập nhật'); loadDashboardData() }
        }
      }, 2000)
      loadMl()
    } catch (err) {
      showToast(err.response?.status === 409 ? 'Đang huấn luyện, vui lòng đợi' : 'Không thể bắt đầu huấn luyện')
    }
  }

  // Update Order Status
  const handleStatusChange = async (order, status) => {
    try {
      await updateOrderStatus(order.numericId, status)
      setOrders((list) => list.map((o) => (o.numericId === order.numericId ? { ...o, status } : o)))
      showToast(`Đơn ${order.id}: ${statusLabels[status]}`)
      fetchAdminDashboard().then(setDash).catch(() => {})
    } catch {
      showToast('Cập nhật trạng thái thất bại')
    }
  }

  // Drill-down: Click category in categories list -> go to products tab filtered by this category
  const handleDrillDownCategory = (catId) => {
    setProdFilterCat(catId)
    setProdPage(1)
    switchTab('products', `?category=${catId}`)
  }

  // Category Actions
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat)
      setCatForm({
        id: cat.id,
        name: cat.name,
        slug: cat.slug || cat.id,
        gender_group: cat.gender_group || 'Chung',
        image_url: cat.image_url || '',
        sort_order: cat.sort_order || 0,
        is_active: Boolean(cat.is_active),
      })
    } else {
      setEditingCat(null)
      setCatForm({
        id: '',
        name: '',
        slug: '',
        gender_group: 'Chung',
        image_url: '',
        sort_order: categories.length + 1,
        is_active: true,
      })
    }
    setCatModalOpen(true)
  }

  const handleSaveCategory = async (e) => {
    e.preventDefault()
    try {
      if (editingCat) {
        await updateAdminCategory(editingCat.id, catForm)
        showToast('Cập nhật danh mục thành công!')
      } else {
        await createAdminCategory(catForm)
        showToast('Thêm danh mục mới thành công!')
      }
      setCatModalOpen(false)
      loadCategories()
      refreshStoreCategories()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu danh mục')
    }
  }

  const handleDeleteCategory = async (cat) => {
    if (cat.product_count > 0) {
      if (!window.confirm(`Danh mục "${cat.name}" hiện đang có ${cat.product_count} sản phẩm liên kết. Bạn có chắc chắn muốn xóa?`)) {
        return
      }
    } else if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
      return
    }
    try {
      await deleteAdminCategory(cat.id)
      showToast('Đã xóa danh mục')
      loadCategories()
      refreshStoreCategories()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xóa danh mục')
    }
  }

  const handleToggleCategoryActive = async (cat) => {
    try {
      await updateAdminCategory(cat.id, { is_active: !cat.is_active })
      loadCategories()
      refreshStoreCategories()
      showToast(`${cat.is_active ? 'Đã ẩn' : 'Đã hiện'} danh mục ${cat.name}`)
    } catch {
      showToast('Lỗi cập nhật trạng thái')
    }
  }

  // ==========================================
  // Product Actions (Add, Edit, Delete)
  // ==========================================
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod)
      setProductForm({
        id: prod.id,
        name: prod.name,
        description: prod.description || '',
        category: prod.category || (categories[0]?.id || 'ao-khoac'),
        gender: prod.gender || 'Nam',
        price: prod.price || 350000,
        image_url: prod.image_url || '',
        brand: prod.brand || 'Maison',
      })
    } else {
      setEditingProduct(null)
      const defaultCat = prodFilterCat !== 'all' ? prodFilterCat : (categories[0]?.id || 'ao-khoac')
      const defaultGender = prodFilterGender !== 'all' ? prodFilterGender : 'Nam'
      setProductForm({
        id: '',
        name: '',
        description: '',
        category: defaultCat,
        gender: defaultGender,
        price: 350000,
        image_url: '',
        brand: 'Maison',
      })
    }
    setProductModalOpen(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    setSavingProduct(true)
    try {
      if (editingProduct) {
        const res = await updateAdminProduct(editingProduct.id, productForm)
        showToast('Cập nhật sản phẩm thành công!')
        if (res?.product) {
          syncProductUpdate(res.product)
        }
      } else {
        const res = await createAdminProduct(productForm)
        showToast('Thêm sản phẩm mới thành công!')
        if (res?.product) {
          syncProductUpdate(res.product)
        }
      }
      setProductModalOpen(false)
      loadAdminProducts()
      loadCategories() // Refresh category product counts
      refreshStoreProducts() // Refresh customer storefront
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu sản phẩm')
    } finally {
      setSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn sản phẩm "${prod.name}" (Mã: ${prod.id})?`)) {
      return
    }
    try {
      await deleteAdminProduct(prod.id)
      syncProductDelete(prod.id)
      showToast('Đã xóa sản phẩm thành công!')
      loadAdminProducts()
      loadCategories() // Refresh category product counts
      refreshStoreProducts() // Refresh customer storefront
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi xóa sản phẩm')
    }
  }

  // Voucher Actions
  const handleOpenVoucherModal = (v = null) => {
    if (v) {
      setEditingVoucher(v)
      setVoucherForm({
        code: v.code,
        discount_type: v.discount_type || 'percent',
        discount_value: v.discount_value,
        min_order_value: v.min_order_value || 0,
        max_discount: v.max_discount || '',
        usage_limit: v.usage_limit || '',
        expires_at: v.expires_at ? v.expires_at.slice(0, 10) : '',
        is_active: Boolean(v.is_active),
      })
    } else {
      setEditingVoucher(null)
      setVoucherForm({
        code: '',
        discount_type: 'percent',
        discount_value: 10,
        min_order_value: 100000,
        max_discount: 100000,
        usage_limit: 100,
        expires_at: '',
        is_active: true,
      })
    }
    setVoucherModalOpen(true)
  }

  const handleSaveVoucher = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...voucherForm,
        code: voucherForm.code.trim().toUpperCase(),
        discount_value: Number(voucherForm.discount_value),
        min_order_value: Number(voucherForm.min_order_value) || 0,
        max_discount: voucherForm.max_discount ? Number(voucherForm.max_discount) : null,
        usage_limit: voucherForm.usage_limit ? Number(voucherForm.usage_limit) : null,
        expires_at: voucherForm.expires_at ? new Date(voucherForm.expires_at).toISOString() : null,
      }
      if (editingVoucher) {
        await updateAdminVoucher(editingVoucher.id, payload)
        showToast('Cập nhật mã giảm giá thành công!')
      } else {
        await createAdminVoucher(payload)
        showToast('Tạo mã giảm giá mới thành công!')
      }
      setVoucherModalOpen(false)
      loadVouchers()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu mã giảm giá')
    }
  }

  const handleDeleteVoucher = async (v) => {
    if (!window.confirm(`Bạn có chắc muốn xóa mã giảm giá "${v.code}"?`)) return
    try {
      await deleteAdminVoucher(v.id)
      showToast('Đã xóa mã giảm giá')
      loadVouchers()
    } catch {
      showToast('Lỗi khi xóa mã giảm giá')
    }
  }

  // Banner Actions
  const handleSaveBanner = async (e) => {
    e.preventDefault()
    setSavingBanner(true)
    try {
      await updateAdminBanner(bannerForm.id || 1, bannerForm)
      showToast('Đã lưu cài đặt Banner trang chủ thành công!')
      loadBanners()
    } catch (err) {
      showToast(err.response?.data?.message || 'Lỗi khi lưu Banner')
    } finally {
      setSavingBanner(false)
    }
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 md:px-6 py-10"><div className="h-64 bg-stone rounded-sm animate-pulse" /></div>
  }
  if (error) {
    return <p className="max-w-7xl mx-auto px-4 py-24 text-center text-sm text-clay">{error}</p>
  }

  const maxRevenue = Math.max(...(dash?.revenueByDay?.map((d) => d.revenue) || [1]), 1)
  const summary = ml?.training_summary || {}
  const metrics = ml?.collaborative_metrics || {}
  const running = ml?.training?.running
  const isMlWakingUp = ml?.status === 'waking_up'

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone">
        <div>
          <h1 className="font-display text-3xl">Hệ thống Quản trị</h1>
          <p className="text-xs text-ink-soft mt-1">Quản lý sản phẩm, danh mục, đơn hàng, mã giảm giá và mô hình gợi ý AI</p>
        </div>
        <button
          onClick={() => {
            loadDashboardData(); loadMl(); loadCategories(); loadVouchers(); loadBanners()
            if (activeTab === 'products') loadAdminProducts()
          }}
          className="flex items-center gap-2 text-sm text-ink-soft hover:text-clay self-start sm:self-auto bg-paper px-3 py-1.5 border border-stone rounded-sm transition-colors"
        >
          <RefreshCw size={15} /> Làm mới dữ liệu
        </button>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex border-b border-stone gap-2 overflow-x-auto text-sm font-medium">
        <button
          onClick={() => switchTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-clay text-clay font-semibold'
              : 'border-transparent text-ink-soft hover:text-ink hover:border-stone-dark'
          }`}
        >
          <LayoutDashboard size={17} /> Tổng quan & Đơn hàng
        </button>
        <button
          onClick={() => switchTab('products')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-clay text-clay font-semibold'
              : 'border-transparent text-ink-soft hover:text-ink hover:border-stone-dark'
          }`}
        >
          <Package size={17} /> Quản lý sản phẩm
          <span className="text-xs bg-clay/10 text-clay font-semibold px-2 py-0.5 rounded-full">{prodTotal || adminProducts.length}</span>
        </button>
        <button
          onClick={() => switchTab('categories')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-clay text-clay font-semibold'
              : 'border-transparent text-ink-soft hover:text-ink hover:border-stone-dark'
          }`}
        >
          <Folders size={17} /> Quản lý danh mục
          <span className="text-xs bg-stone px-2 py-0.5 rounded-full text-ink-soft">{categories.length}</span>
        </button>
        <button
          onClick={() => switchTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'vouchers'
              ? 'border-clay text-clay font-semibold'
              : 'border-transparent text-ink-soft hover:text-ink hover:border-stone-dark'
          }`}
        >
          <Ticket size={17} /> Mã giảm giá (Vouchers)
          <span className="text-xs bg-stone px-2 py-0.5 rounded-full text-ink-soft">{vouchers.length}</span>
        </button>
        <button
          onClick={() => switchTab('banners')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'banners'
              ? 'border-clay text-clay font-semibold'
              : 'border-transparent text-ink-soft hover:text-ink hover:border-stone-dark'
          }`}
        >
          <ImageIcon size={17} /> Banner trang chủ
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DASHBOARD & ORDERS & MACHINE LEARNING STATUS */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Doanh thu (không tính đơn huỷ)" value={formatCurrency(dash?.revenue || 0)} />
            <StatCard label="Đơn hàng" value={dash?.orderCount || 0} />
            <StatCard label="Khách hàng" value={dash?.userCount || 0} hint={`${dash?.interactionCount || 0} lượt tương tác`} />
            <StatCard
              label="CTR gợi ý"
              value={`${dash?.recommendation?.ctr || 0}%`}
              hint={`${dash?.recommendation?.clicks || 0} click / ${dash?.recommendation?.impressions || 0} lượt hiển thị`}
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Panel title="Doanh thu 7 ngày gần nhất">
              <div className="flex items-end gap-2 h-44">
                {dash?.revenueByDay?.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${formatCurrency(d.revenue)} · ${d.orders} đơn`}>
                    <div
                      className="w-full bg-clay/80 rounded-t-sm min-h-[2px]"
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className="text-[11px] text-ink-soft mt-2">{d.date.slice(8)}/{d.date.slice(5, 7)}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="CTR theo thuật toán gợi ý">
              {dash?.recommendation?.byAlgorithm?.length === 0 ? (
                <p className="text-sm text-ink-soft">Chưa có lượt hiển thị gợi ý nào.</p>
              ) : (
                <div className="space-y-4">
                  {dash?.recommendation?.byAlgorithm?.map((a) => (
                    <div key={a.algorithm}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span>{ALGO_LABELS[a.algorithm] || a.algorithm}</span>
                        <span className="text-ink-soft">{a.ctr}% · {a.clicks}/{a.impressions}</span>
                      </div>
                      <div className="h-2 bg-stone rounded-full overflow-hidden">
                        <div className="h-full bg-moss" style={{ width: `${Math.min(a.ctr * 4, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-ink-soft">Thanh hiển thị theo thang 0–25% để dễ so sánh.</p>
                </div>
              )}
            </Panel>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Panel title="Sản phẩm được quan tâm nhiều nhất">
              {dash?.topProducts?.length === 0 ? (
                <p className="text-sm text-ink-soft">Chưa có dữ liệu tương tác.</p>
              ) : (
                <ol className="space-y-2 text-sm">
                  {dash?.topProducts?.map((p, i) => (
                    <li key={p.id} className="flex justify-between gap-4">
                      <span>{i + 1}. {p.name}</span>
                      <span className="text-ink-soft shrink-0">{p.interactions} lượt</span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="flex flex-wrap gap-2 mt-5">
                {dash?.ordersByStatus?.map((s) => (
                  <span key={s.status} className="text-xs border border-stone-dark rounded-full px-3 py-1">
                    {statusLabels[s.status]}: {s.count}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel
              title="Mô hình Machine Learning (FastAPI)"
              action={
                <button
                  onClick={handleRetrain}
                  disabled={running || isMlWakingUp}
                  className="flex items-center gap-2 text-sm px-3 py-1.5 bg-ink text-ivory rounded-sm hover:bg-ink-soft disabled:opacity-60 transition-colors"
                >
                  <Brain size={15} /> {running ? 'Đang huấn luyện...' : 'Huấn luyện lại'}
                </button>
              }
            >
              {isMlWakingUp ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                    <Loader2 size={16} className="animate-spin text-amber-600" />
                    <span>Dịch vụ ML đang thức dậy (Render Cold-Start)...</span>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Render miễn phí tự động đưa container vào trạng thái ngủ khi không có truy cập. Hệ thống đang tự động gửi yêu cầu kết nối lại, trang sẽ tự chuyển sang sẵn sàng ngay khi service phản hồi.
                  </p>
                </div>
              ) : mlError ? (
                <div className="p-4 bg-stone-light/50 border border-stone rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-clay flex items-center gap-1.5">
                      <AlertCircle size={15} /> {mlError}
                    </p>
                    <button
                      onClick={loadMl}
                      className="text-xs text-ink font-medium underline hover:text-clay"
                    >
                      Thử lại ngay
                    </button>
                  </div>
                </div>
              ) : !ml ? (
                <p className="text-sm text-ink-soft">Đang kiểm tra kết nối ML service...</p>
              ) : (
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-ink-soft">Trạng thái kết nối</dt>
                  <dd>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-moss/10 text-moss">
                      <Check size={12} /> Hoạt động (Online)
                    </span>
                  </dd>
                  <dt className="text-ink-soft">Nguồn dữ liệu</dt>
                  <dd>{summary.source || '—'}</dd>
                  <dt className="text-ink-soft">Tương tác thật</dt>
                  <dd>{summary.n_real ?? '—'} ({summary.n_real_users ?? 0} người dùng)</dd>
                  <dt className="text-ink-soft">Dữ liệu giả lập (nền)</dt>
                  <dd>{summary.n_synthetic ?? '—'}</dd>
                  <dt className="text-ink-soft">RMSE / MAE (5-fold)</dt>
                  <dd>{metrics.rmse_cv_mean?.toFixed(3)} / {metrics.mae_cv_mean?.toFixed(3)}</dd>
                  <dt className="text-ink-soft">Huấn luyện lúc</dt>
                  <dd>{summary.trained_at ? new Date(summary.trained_at).toLocaleString('vi-VN') : '—'}</dd>
                </dl>
              )}
            </Panel>
          </div>

          <Panel title={`Đơn hàng (${orders.length})`}>
            {orders.length === 0 ? (
              <p className="text-sm text-ink-soft">Chưa có đơn hàng nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr className="text-left text-ink-soft border-b border-stone">
                      <th className="py-2 pr-3 font-medium">Mã</th>
                      <th className="py-2 pr-3 font-medium">Khách hàng</th>
                      <th className="py-2 pr-3 font-medium">Ngày đặt</th>
                      <th className="py-2 pr-3 font-medium">Thanh toán</th>
                      <th className="py-2 pr-3 font-medium text-right">Tổng tiền</th>
                      <th className="py-2 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-stone last:border-0 hover:bg-stone-light/20 transition-colors">
                        <td className="py-3 pr-3 font-medium">{o.id}</td>
                        <td className="py-3 pr-3">
                          {o.customerName || '—'}
                          <span className="block text-xs text-ink-soft">{o.customerEmail}</span>
                          {o.shipping?.note && (
                            <span className="block text-[11px] text-clay line-clamp-1">{o.shipping.note}</span>
                          )}
                        </td>
                        <td className="py-3 pr-3">{formatDate(o.date)}</td>
                        <td className="py-3 pr-3">{paymentLabels[o.paymentMethod] || '—'}</td>
                        <td className="py-3 pr-3 text-right">{formatCurrency(o.total)}</td>
                        <td className="py-3">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o, e.target.value)}
                            className="border border-stone-dark rounded-sm px-2 py-1 bg-paper text-sm outline-none focus:border-ink"
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: QUẢN LÝ SẢN PHẨM (PRODUCT MANAGEMENT - CRUD)       */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <Panel
            title={
              prodFilterCat !== 'all'
                ? `Danh sách sản phẩm thuộc danh mục: "${categories.find((c) => c.id === prodFilterCat)?.name || prodFilterCat}"`
                : 'Tất cả sản phẩm trong kho'
            }
            action={
              <button
                onClick={() => handleOpenProductModal()}
                className="flex items-center gap-1.5 text-sm px-3.5 py-2 bg-ink text-ivory rounded-sm hover:bg-ink-soft transition-colors shadow-xs"
              >
                <Plus size={16} /> Thêm sản phẩm mới
              </button>
            }
          >
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-5 p-3.5 bg-stone-light/40 border border-stone rounded-sm">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-2.5 text-ink-soft" />
                <input
                  type="text"
                  value={prodSearch}
                  onChange={(e) => {
                    setProdSearch(e.target.value)
                    setProdPage(1)
                  }}
                  placeholder="Tìm theo tên sản phẩm..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs md:text-sm bg-paper border border-stone-dark rounded-sm outline-none focus:border-ink"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-ink-soft">
                  <Filter size={14} /> Danh mục:
                </div>
                <select
                  value={prodFilterCat}
                  onChange={(e) => {
                    setProdFilterCat(e.target.value)
                    setProdPage(1)
                  }}
                  className="text-xs py-1.5 px-2.5 bg-paper border border-stone-dark rounded-sm outline-none focus:border-ink"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1 text-xs text-ink-soft ml-1">
                  Giới tính:
                </div>
                <select
                  value={prodFilterGender}
                  onChange={(e) => {
                    setProdFilterGender(e.target.value)
                    setProdPage(1)
                  }}
                  className="text-xs py-1.5 px-2.5 bg-paper border border-stone-dark rounded-sm outline-none focus:border-ink"
                >
                  <option value="all">Tất cả giới tính</option>
                  <option value="Nam">Đồ Nam</option>
                  <option value="Nữ">Đồ Nữ</option>
                  <option value="Chung">Chung (Unisex)</option>
                </select>

                {(prodFilterCat !== 'all' || prodFilterGender !== 'all' || prodSearch) && (
                  <button
                    onClick={() => {
                      setProdFilterCat('all')
                      setProdFilterGender('all')
                      setProdSearch('')
                      setProdPage(1)
                      navigate('/admin/products')
                    }}
                    className="text-xs text-clay hover:underline px-2 py-1"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
            </div>

            {/* Products Table */}
            {loadingProds ? (
              <div className="space-y-3">
                <div className="h-12 bg-stone rounded-sm animate-pulse" />
                <div className="h-12 bg-stone rounded-sm animate-pulse" />
                <div className="h-12 bg-stone rounded-sm animate-pulse" />
              </div>
            ) : adminProducts.length === 0 ? (
              <div className="py-16 text-center text-ink-soft border border-dashed border-stone rounded-sm">
                <Package size={36} className="mx-auto mb-2 text-ink-soft/60" />
                <p className="text-sm font-medium">Không tìm thấy sản phẩm nào phù hợp.</p>
                <p className="text-xs mt-1">Hãy thử xóa bộ lọc hoặc bấm "Thêm sản phẩm mới".</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[760px]">
                  <thead>
                    <tr className="text-left text-ink-soft border-b border-stone">
                      <th className="py-2.5 pr-3 font-medium w-16">Hình ảnh</th>
                      <th className="py-2.5 pr-3 font-medium">Tên sản phẩm</th>
                      <th className="py-2.5 pr-3 font-medium">Danh mục</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Giới tính</th>
                      <th className="py-2.5 pr-3 font-medium text-right">Giá bán</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Đánh giá</th>
                      <th className="py-2.5 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminProducts.map((p) => {
                      const catName = categories.find((c) => c.id === p.category)?.name || p.category_name || p.category
                      return (
                        <tr key={p.id} className="border-b border-stone last:border-0 hover:bg-stone-light/20 transition-colors">
                          <td className="py-2.5 pr-3">
                            <div className="h-12 w-10 rounded-sm overflow-hidden bg-stone border border-stone-dark/30 shrink-0">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.onerror = null
                                  e.currentTarget.src = p.gender === 'Nữ'
                                    ? 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=200&auto=format&fit=crop&q=80'
                                    : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80'
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 pr-3">
                            <p className="font-medium text-ink line-clamp-1">{p.name}</p>
                            <span className="font-mono text-[11px] text-ink-soft">ID: {p.id}</span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className="text-xs bg-stone px-2 py-0.5 rounded text-ink">
                              {catName}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${
                              p.gender === 'Nam' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              p.gender === 'Nữ' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                              'bg-stone/50 text-ink-soft border-stone'
                            }`}>
                              {p.gender || 'Chung'}
                            </span>
                          </td>
                          <td className="py-2.5 pr-3 text-right font-semibold text-ink">
                            {formatCurrency(p.price)}
                          </td>
                          <td className="py-2.5 pr-3 text-center text-xs text-ink-soft">
                            ⭐ {p.avg_rating || 4.5}
                          </td>
                          <td className="py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={`/products/${p.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-ink-soft hover:text-ink hover:bg-stone rounded transition-colors"
                                title="Mở trang xem sản phẩm này"
                              >
                                <ExternalLink size={15} />
                              </a>
                              <button
                                onClick={() => handleOpenProductModal(p)}
                                className="p-1.5 text-ink-soft hover:text-ink hover:bg-stone rounded transition-colors"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="p-1.5 text-ink-soft hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {prodTotalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone text-xs text-ink-soft">
                <span>
                  Trang <strong>{prodPage}</strong> / <strong>{prodTotalPages}</strong> (Tổng {prodTotal} sản phẩm)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setProdPage((p) => Math.max(1, p - 1))}
                    disabled={prodPage <= 1}
                    className="p-1.5 border border-stone-dark rounded-sm hover:bg-stone disabled:opacity-40 transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: Math.min(prodTotalPages, 7) }).map((_, i) => {
                    const pageNum = i + 1
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setProdPage(pageNum)}
                        className={`h-7 w-7 rounded-sm border transition-colors ${
                          prodPage === pageNum
                            ? 'bg-ink text-ivory border-ink font-semibold'
                            : 'border-stone-dark hover:bg-stone text-ink-soft'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setProdPage((p) => Math.min(prodTotalPages, p + 1))}
                    disabled={prodPage >= prodTotalPages}
                    className="p-1.5 border border-stone-dark rounded-sm hover:bg-stone disabled:opacity-40 transition-colors"
                    title="Trang sau"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </Panel>

          {/* Modal Add / Edit Product */}
          {productModalOpen && (
            <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-paper border border-stone rounded-sm p-6 w-full max-w-lg shadow-xl animate-in fade-in max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone">
                  <h3 className="font-display text-xl">
                    {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới vào kho'}
                  </h3>
                  <button onClick={() => setProductModalOpen(false)} className="text-ink-soft hover:text-ink">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Tên sản phẩm *</label>
                    <input
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="VD: Áo khoác Blazer dáng suông phong cách Hàn Quốc"
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Mã sản phẩm (ID)</label>
                      <input
                        disabled={Boolean(editingProduct)}
                        value={productForm.id}
                        onChange={(e) => setProductForm({ ...productForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                        placeholder="Tự sinh nếu để trống"
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink font-mono text-xs disabled:bg-stone/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Giá bán (VNĐ) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="1000"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                        placeholder="350000"
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Danh mục *</label>
                      <select
                        required
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Đối tượng / Giới tính *</label>
                      <select
                        required
                        value={productForm.gender}
                        onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      >
                        <option value="Nam">Đồ Nam</option>
                        <option value="Nữ">Đồ Nữ</option>
                        <option value="Chung">Chung (Unisex)</option>
                      </select>
                    </div>
                  </div>

                  {/* Image input & live preview */}
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Đường dẫn hình ảnh (URL)</label>
                    <div className="flex gap-3 items-center">
                      <div className="h-16 w-14 rounded-sm overflow-hidden bg-stone border border-stone-dark/40 shrink-0">
                        {productForm.image_url ? (
                          <img
                            src={productForm.image_url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-ink-soft">Ảnh</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          value={productForm.image_url}
                          onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full border border-stone-dark rounded-sm px-3 py-2 text-xs bg-paper outline-none focus:border-ink font-mono"
                        />
                        <p className="text-[11px] text-ink-soft mt-1">Dán URL ảnh sản phẩm từ Unsplash, Imgur hoặc CDN</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Mô tả sản phẩm</label>
                    <textarea
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Mô tả chất liệu, kiểu dáng, phong cách..."
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-3 border-t border-stone">
                    <button
                      type="button"
                      onClick={() => setProductModalOpen(false)}
                      className="px-4 py-2 border border-stone-dark rounded-sm text-ink-soft hover:text-ink text-xs transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="px-5 py-2 bg-ink text-ivory rounded-sm hover:bg-ink-soft text-xs transition-colors disabled:opacity-50"
                    >
                      {savingProduct ? 'Đang lưu...' : (editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: QUẢN LÝ DANH MỤC (CATEGORY MANAGEMENT - PROMPT 2) */}
      {/* ========================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <Panel
            title="Danh sách danh mục sản phẩm"
            action={
              <button
                onClick={() => handleOpenCategoryModal()}
                className="flex items-center gap-1.5 text-sm px-3.5 py-2 bg-ink text-ivory rounded-sm hover:bg-ink-soft transition-colors"
              >
                <Plus size={16} /> Thêm danh mục mới
              </button>
            }
          >
            <p className="text-xs text-ink-soft mb-4">
              Quản lý các nhóm danh mục. Bạn có thể bấm vào tên danh mục hoặc số lượng sản phẩm để chuyển đến danh sách sản phẩm thuộc danh mục đó (Drill-down).
            </p>

            {loadingCats ? (
              <div className="h-40 bg-stone rounded-sm animate-pulse" />
            ) : categories.length === 0 ? (
              <p className="text-sm text-ink-soft">Chưa có danh mục nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="text-left text-ink-soft border-b border-stone">
                      <th className="py-2.5 pr-3 font-medium">Mã / Slug</th>
                      <th className="py-2.5 pr-3 font-medium">Tên danh mục</th>
                      <th className="py-2.5 pr-3 font-medium">Nhóm giới tính</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Thứ tự</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Số sản phẩm</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Trạng thái</th>
                      <th className="py-2.5 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id} className="border-b border-stone last:border-0 hover:bg-stone-light/20 transition-colors">
                        <td className="py-3 pr-3 font-mono text-xs font-semibold text-ink">{c.id}</td>
                        <td className="py-3 pr-3 font-medium">
                          <button
                            onClick={() => handleDrillDownCategory(c.id)}
                            className="flex items-center gap-2 hover:text-clay text-left group"
                            title={`Bấm để xem tất cả sản phẩm thuộc danh mục "${c.name}"`}
                          >
                            {c.image_url ? (
                              <img src={c.image_url} alt="" className="h-7 w-7 rounded object-cover border border-stone" />
                            ) : (
                              <div className="h-7 w-7 rounded bg-stone flex items-center justify-center text-[10px] text-ink-soft">📁</div>
                            )}
                            <span className="group-hover:underline">{c.name}</span>
                          </button>
                        </td>
                        <td className="py-3 pr-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            c.gender_group === 'Nam' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            c.gender_group === 'Nữ' ? 'bg-pink-50 text-pink-700 border-pink-200' :
                            'bg-stone/50 text-ink-soft border-stone'
                          }`}>
                            {c.gender_group || 'Chung'}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-center text-ink-soft">{c.sort_order || 0}</td>
                        <td className="py-3 pr-3 text-center">
                          <button
                            onClick={() => handleDrillDownCategory(c.id)}
                            className="font-semibold text-clay bg-clay/10 hover:bg-clay/20 px-2.5 py-0.5 rounded-full text-xs transition-colors"
                            title={`Xem ${c.product_count || 0} sản phẩm`}
                          >
                            {c.product_count || 0} sp →
                          </button>
                        </td>
                        <td className="py-3 pr-3 text-center">
                          <button
                            onClick={() => handleToggleCategoryActive(c)}
                            title="Bấm để bật / tắt hiển thị"
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                              c.is_active
                                ? 'bg-moss/10 text-moss hover:bg-moss/20'
                                : 'bg-stone text-ink-soft hover:bg-stone-dark'
                            }`}
                          >
                            {c.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                            {c.is_active ? 'Đang hiện' : 'Đang ẩn'}
                          </button>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDrillDownCategory(c.id)}
                              className="p-1.5 text-xs text-clay hover:bg-clay/10 rounded transition-colors flex items-center gap-1"
                              title="Xem sản phẩm trong danh mục này"
                            >
                              <Package size={14} />
                              <span className="hidden sm:inline">Xem sp</span>
                            </button>
                            <button
                              onClick={() => handleOpenCategoryModal(c)}
                              className="p-1.5 text-ink-soft hover:text-ink hover:bg-stone rounded transition-colors"
                              title="Chỉnh sửa danh mục"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(c)}
                              className="p-1.5 text-ink-soft hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa danh mục"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Modal Add / Edit Category */}
          {catModalOpen && (
            <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-paper border border-stone rounded-sm p-6 w-full max-w-md shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl">
                    {editingCat ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                  </h3>
                  <button onClick={() => setCatModalOpen(false)} className="text-ink-soft hover:text-ink">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveCategory} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Mã danh mục (ID / Slug)</label>
                    <input
                      required
                      disabled={Boolean(editingCat)}
                      value={catForm.id}
                      onChange={(e) => setCatForm({ ...catForm, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      placeholder="VD: ao-khoac, vay-dam, quan-tay"
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink disabled:bg-stone/30"
                    />
                    <p className="text-[11px] text-ink-soft mt-1">Dùng để phân loại sản phẩm trong database và liên kết URL.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Tên danh mục hiển thị</label>
                    <input
                      required
                      value={catForm.name}
                      onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                      placeholder="VD: Áo khoác & Blazer, Váy & Đầm"
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Nhóm giới tính</label>
                      <select
                        value={catForm.gender_group}
                        onChange={(e) => setCatForm({ ...catForm, gender_group: e.target.value })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      >
                        <option value="Chung">Chung (Unisex)</option>
                        <option value="Nam">Đồ Nam</option>
                        <option value="Nữ">Đồ Nữ</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Thứ tự ưu tiên</label>
                      <input
                        type="number"
                        value={catForm.sort_order}
                        onChange={(e) => setCatForm({ ...catForm, sort_order: Number(e.target.value) })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Link ảnh đại diện (Tùy chọn)</label>
                    <input
                      value={catForm.image_url}
                      onChange={(e) => setCatForm({ ...catForm, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="cat_active"
                      checked={catForm.is_active}
                      onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
                      className="accent-clay h-4 w-4"
                    />
                    <label htmlFor="cat_active" className="text-xs text-ink cursor-pointer">
                      Hiển thị trên Menu & Bộ lọc danh mục
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end pt-3 border-t border-stone">
                    <button
                      type="button"
                      onClick={() => setCatModalOpen(false)}
                      className="px-4 py-2 border border-stone-dark rounded-sm text-ink-soft hover:text-ink text-xs"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-ink text-ivory rounded-sm hover:bg-ink-soft text-xs"
                    >
                      {editingCat ? 'Lưu thay đổi' : 'Thêm mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: QUẢN LÝ MÃ GIẢM GIÁ (VOUCHER MANAGEMENT - PROMPT 4) */}
      {/* ========================================================= */}
      {activeTab === 'vouchers' && (
        <div className="space-y-6">
          <Panel
            title="Quản lý mã giảm giá (Vouchers)"
            action={
              <button
                onClick={() => handleOpenVoucherModal()}
                className="flex items-center gap-1.5 text-sm px-3.5 py-2 bg-ink text-ivory rounded-sm hover:bg-ink-soft transition-colors"
              >
                <Plus size={16} /> Tạo mã voucher mới
              </button>
            }
          >
            <p className="text-xs text-ink-soft mb-4">
              Tạo và quản lý các mã ưu đãi giảm giá theo phần trăm (%) hoặc số tiền cố định (VNĐ). Khách hàng có thể nhập mã này tại trang Thanh toán để được giảm giá tự động.
            </p>

            {loadingVouchers ? (
              <div className="h-40 bg-stone rounded-sm animate-pulse" />
            ) : vouchers.length === 0 ? (
              <p className="text-sm text-ink-soft">Chưa có mã giảm giá nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[750px]">
                  <thead>
                    <tr className="text-left text-ink-soft border-b border-stone">
                      <th className="py-2.5 pr-3 font-medium">Mã code</th>
                      <th className="py-2.5 pr-3 font-medium">Loại & Mức giảm</th>
                      <th className="py-2.5 pr-3 font-medium">Đơn tối thiểu</th>
                      <th className="py-2.5 pr-3 font-medium">Giảm tối đa</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Đã dùng / Giới hạn</th>
                      <th className="py-2.5 pr-3 font-medium">Hạn sử dụng</th>
                      <th className="py-2.5 pr-3 font-medium text-center">Trạng thái</th>
                      <th className="py-2.5 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((v) => {
                      const isExpired = v.expires_at && new Date(v.expires_at) < new Date()
                      const isLimitReached = v.usage_limit && v.used_count >= v.usage_limit
                      return (
                        <tr key={v.id} className="border-b border-stone last:border-0 hover:bg-stone-light/20 transition-colors">
                          <td className="py-3 pr-3 font-mono font-bold text-clay tracking-wider">{v.code}</td>
                          <td className="py-3 pr-3 font-medium">
                            {v.discount_type === 'percent' ? (
                              <span className="text-moss">Giảm {v.discount_value}%</span>
                            ) : (
                              <span className="text-moss">Giảm {formatCurrency(v.discount_value)}</span>
                            )}
                          </td>
                          <td className="py-3 pr-3 text-ink-soft">{formatCurrency(v.min_order_value || 0)}</td>
                          <td className="py-3 pr-3 text-ink-soft">
                            {v.max_discount ? formatCurrency(v.max_discount) : 'Không giới hạn'}
                          </td>
                          <td className="py-3 pr-3 text-center">
                            <span className="font-semibold text-ink">{v.used_count || 0}</span>
                            <span className="text-ink-soft"> / {v.usage_limit || '∞'}</span>
                          </td>
                          <td className="py-3 pr-3 text-xs text-ink-soft">
                            {v.expires_at ? formatDate(v.expires_at) : 'Vô thời hạn'}
                          </td>
                          <td className="py-3 pr-3 text-center">
                            {!v.is_active ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone text-ink-soft">Đã tắt</span>
                            ) : isExpired ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Hết hạn</span>
                            ) : isLimitReached ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Hết lượt</span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-moss/10 text-moss font-medium">Hoạt động</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenVoucherModal(v)}
                                className="p-1.5 text-ink-soft hover:text-ink hover:bg-stone rounded transition-colors"
                                title="Chỉnh sửa mã"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteVoucher(v)}
                                className="p-1.5 text-ink-soft hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Xóa mã"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          {/* Modal Add / Edit Voucher */}
          {voucherModalOpen && (
            <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-paper border border-stone rounded-sm p-6 w-full max-w-md shadow-xl animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl">
                    {editingVoucher ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã voucher mới'}
                  </h3>
                  <button onClick={() => setVoucherModalOpen(false)} className="text-ink-soft hover:text-ink">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSaveVoucher} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Mã voucher (In hoa, không dấu)</label>
                    <input
                      required
                      value={voucherForm.code}
                      onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      placeholder="VD: MAISON10, TET2026, FREESHIP"
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink font-mono font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Loại giảm giá</label>
                      <select
                        value={voucherForm.discount_type}
                        onChange={(e) => setVoucherForm({ ...voucherForm, discount_type: e.target.value })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      >
                        <option value="percent">Theo phần trăm (%)</option>
                        <option value="amount">Số tiền cố định (VNĐ)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">
                        {voucherForm.discount_type === 'percent' ? 'Mức giảm (%)' : 'Số tiền giảm (VNĐ)'}
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={voucherForm.discount_value}
                        onChange={(e) => setVoucherForm({ ...voucherForm, discount_value: e.target.value })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Đơn tối thiểu (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        value={voucherForm.min_order_value}
                        onChange={(e) => setVoucherForm({ ...voucherForm, min_order_value: e.target.value })}
                        placeholder="0"
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Giảm tối đa (VNĐ)</label>
                      <input
                        type="number"
                        min="0"
                        value={voucherForm.max_discount}
                        onChange={(e) => setVoucherForm({ ...voucherForm, max_discount: e.target.value })}
                        placeholder="Để trống nếu không giới hạn"
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Số lượt dùng tối đa</label>
                      <input
                        type="number"
                        min="1"
                        value={voucherForm.usage_limit}
                        onChange={(e) => setVoucherForm({ ...voucherForm, usage_limit: e.target.value })}
                        placeholder="Vô hạn"
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Ngày hết hạn</label>
                      <input
                        type="date"
                        value={voucherForm.expires_at}
                        onChange={(e) => setVoucherForm({ ...voucherForm, expires_at: e.target.value })}
                        className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="v_active"
                      checked={voucherForm.is_active}
                      onChange={(e) => setVoucherForm({ ...voucherForm, is_active: e.target.checked })}
                      className="accent-clay h-4 w-4"
                    />
                    <label htmlFor="v_active" className="text-xs text-ink cursor-pointer">
                      Kích hoạt cho phép khách hàng áp dụng ngay
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end pt-3 border-t border-stone">
                    <button
                      type="button"
                      onClick={() => setVoucherModalOpen(false)}
                      className="px-4 py-2 border border-stone-dark rounded-sm text-ink-soft hover:text-ink text-xs"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-ink text-ivory rounded-sm hover:bg-ink-soft text-xs"
                    >
                      {editingVoucher ? 'Lưu thay đổi' : 'Tạo mã voucher'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: QUẢN LÝ BANNER TRANG CHỦ (BANNER MANAGEMENT)       */}
      {/* ========================================================= */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Banner Live Preview */}
            <Panel title="Xem trước hiển thị trên Trang chủ">
              <div className="border border-stone rounded-sm p-4 bg-paper/60 space-y-4">
                <div className="aspect-[16/9] md:aspect-[21/9] rounded-sm overflow-hidden bg-stone relative">
                  <img
                    src={bannerForm.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent flex flex-col justify-end p-5 text-ivory">
                    {bannerForm.subtitle && (
                      <p className="text-xs text-clay font-medium uppercase tracking-wider mb-1">{bannerForm.subtitle}</p>
                    )}
                    <h3 className="font-display text-2xl font-semibold leading-tight mb-1">{bannerForm.title || 'Tiêu đề Banner'}</h3>
                    <p className="text-xs text-ivory/80 line-clamp-2 max-w-md mb-3">{bannerForm.description}</p>
                    <div>
                      <span className="inline-block px-4 py-1.5 bg-ink text-ivory text-xs rounded-sm">
                        {bannerForm.cta_text || 'Khám phá ngay'} →
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-soft pt-1">
                  <span>Trạng thái: <strong className={bannerForm.is_active ? 'text-moss' : 'text-clay'}>{bannerForm.is_active ? 'Đang kích hoạt' : 'Đang tạm dừng'}</strong></span>
                  <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-ink">
                    Mở trang chủ khách hàng <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </Panel>

            {/* Banner Edit Form */}
            <Panel title="Cài đặt thông tin Banner quảng cáo">
              <form onSubmit={handleSaveBanner} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">Tiêu đề chính (Title)</label>
                  <input
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    placeholder="VD: Mặc đẹp mỗi ngày, không cần cố gắng"
                    className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">Tiêu đề phụ / Bộ sưu tập (Subtitle)</label>
                  <input
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    placeholder="VD: Bộ sưu tập Thu Đông 2026, Xu hướng mới nhất"
                    className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">Mô tả chi tiết</label>
                  <textarea
                    rows={3}
                    value={bannerForm.description}
                    onChange={(e) => setBannerForm({ ...bannerForm, description: e.target.value })}
                    placeholder="Mô tả thông điệp quảng cáo trên trang chủ..."
                    className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1">Đường dẫn hình ảnh Banner (URL)</label>
                  <input
                    required
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({ ...bannerForm, image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Chữ trên nút bấm (CTA)</label>
                    <input
                      value={bannerForm.cta_text}
                      onChange={(e) => setBannerForm({ ...bannerForm, cta_text: e.target.value })}
                      placeholder="VD: Khám phá ngay, Mua ngay"
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1">Đường dẫn khi bấm nút (Link)</label>
                    <input
                      value={bannerForm.cta_link}
                      onChange={(e) => setBannerForm({ ...bannerForm, cta_link: e.target.value })}
                      placeholder="/products hoặc /products?category=ao-khoac"
                      className="w-full border border-stone-dark rounded-sm px-3 py-2 text-sm bg-paper outline-none focus:border-ink"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="banner_active"
                    checked={bannerForm.is_active}
                    onChange={(e) => setBannerForm({ ...bannerForm, is_active: e.target.checked })}
                    className="accent-clay h-4 w-4"
                  />
                  <label htmlFor="banner_active" className="text-xs text-ink cursor-pointer">
                    Kích hoạt hiển thị Banner này ngoài trang chủ
                  </label>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingBanner}
                    className="w-full py-2.5 bg-ink text-ivory text-sm rounded-sm hover:bg-ink-soft transition-colors disabled:opacity-50"
                  >
                    {savingBanner ? 'Đang lưu...' : 'Lưu thay đổi Banner'}
                  </button>
                </div>
              </form>
            </Panel>
          </div>
        </div>
      )}
    </div>
  )
}
