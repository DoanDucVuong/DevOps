import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Navigate, Link } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('orders') // 'orders' hoặc 'products'
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])

  // State cho form thêm sản phẩm
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'Áo sơ mi',
    image: '',
    description: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('tmdtwed-orders') || '[]')
      setOrders(savedOrders)
      const savedProducts = JSON.parse(localStorage.getItem('tmdtwed-products') || '[]')
      setProducts(savedProducts)
    } catch (e) {}
  }, [])

  // Cập nhật trạng thái đơn hàng
  const updateStatus = (id, st) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status: st } : o))
    setOrders(updated)
    localStorage.setItem('tmdtwed-orders', JSON.stringify(updated))
  }

  // Thêm sản phẩm mới
  const handleAddProduct = (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) {
      alert('Vui lòng nhập tên và giá sản phẩm!')
      return
    }

    const item = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      image: newProduct.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
      description: newProduct.description
    }

    const updated = [item, ...products]
    setProducts(updated)
    localStorage.setItem('tmdtwed-products', JSON.stringify(updated))
    setNewProduct({ name: '', price: '', category: 'Áo sơ mi', image: '', description: '' })
    setMessage('Đã thêm sản phẩm thành công!')
    setTimeout(() => setMessage(''), 3000)
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Tiêu đề & thanh điều hướng */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Trang Quản Trị (Admin)</h1>
          <p className="text-gray-600">Xin chào, {user.name} ({user.email})</p>
        </div>
        <Link to="/" className="text-sm bg-black text-white px-4 py-2 rounded hover:opacity-90">
          Xem cửa hàng
        </Link>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white border rounded shadow-sm">
          <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
          <p className="text-2xl font-bold mt-2">{orders.length}</p>
        </div>
        <div className="p-6 bg-white border rounded shadow-sm">
          <p className="text-gray-500 text-sm">Sản phẩm tự thêm</p>
          <p className="text-2xl font-bold mt-2">{products.length}</p>
        </div>
        <div className="p-6 bg-white border rounded shadow-sm">
          <p className="text-gray-500 text-sm">Tài khoản quản trị</p>
          <p className="text-2xl font-bold mt-2 text-green-600">Đang hoạt động</p>
        </div>
      </div>

      {/* Tabs chuyển đổi chức năng */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'orders' ? 'border-black text-black' : 'border-transparent text-gray-500'
          }`}
        >
          Quản lý Đơn hàng ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'products' ? 'border-black text-black' : 'border-transparent text-gray-500'
          }`}
        >
          Thêm Sản phẩm ({products.length})
        </button>
      </div>

      {/* TAB 1: DANH SÁCH ĐƠN HÀNG */}
      {activeTab === 'orders' && (
        <div className="bg-white border rounded p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Danh sách Đơn hàng</h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="p-3">Mã đơn</th>
                    <th className="p-3">Khách hàng</th>
                    <th className="p-3">Tổng tiền</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">#{o.id}</td>
                      <td className="p-3">{o.customerName || o.email || 'Khách'}</td>
                      <td className="p-3">{(o.total || 0).toLocaleString()} đ</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                          {o.status || 'Chờ xử lý'}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={o.status || 'Chờ xử lý'}
                          onChange={(e) => updateStatus(o.id, e.target.value)}
                          className="border rounded p-1 text-xs"
                        >
                          <option value="Chờ xử lý">Chờ xử lý</option>
                          <option value="Đang giao">Đang giao</option>
                          <option value="Hoàn thành">Hoàn thành</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FORM THÊM SẢN PHẨM */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border rounded p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Thêm sản phẩm mới</h2>
            {message && <p className="mb-4 text-sm text-green-600 font-medium">{message}</p>}
            <form onSubmit={handleAddProduct} className="space-y-4 text-sm">
              <div>
                <label className="block mb-1 font-medium">Tên sản phẩm</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Áo sơ mi Linen"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    required
                    placeholder="250000"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Danh mục</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full border rounded p-2"
                  >
                    <option value="Áo sơ mi">Áo sơ mi</option>
                    <option value="Áo thun">Áo thun</option>
                    <option value="Áo khoác">Áo khoác</option>
                    <option value="Quần">Quần</option>
                    <option value="Váy & Đầm">Váy & Đầm</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Link ảnh (URL)</label>
                <input
                  type="text"
                  placeholder="https://... (để trống sẽ dùng ảnh mặc định)"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  placeholder="Mô tả chất liệu, kiểu dáng..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full border rounded p-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded font-medium hover:opacity-90"
              >
                Lưu sản phẩm
              </button>
            </form>
          </div>

          <div className="bg-white border rounded p-6 shadow-sm overflow-y-auto max-h-[500px]">
            <h2 className="text-lg font-semibold mb-4">Sản phẩm đã thêm</h2>
            {products.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có sản phẩm nào do Admin thêm.</p>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 border-b pb-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.category} — {Number(p.price).toLocaleString()} đ</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}