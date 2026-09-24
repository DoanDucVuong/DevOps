import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Navigate, Link } from 'react-router-dom'

export default function Admin() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('tmdtwed-orders') || '[]')
      setOrders(saved)
    } catch (e) {}
  }, [])

  const updateStatus = (id, st) => {
    const updated = orders.map((o) => (o.id === id ? { ...o, status: st } : o))
    setOrders(updated)
    localStorage.setItem('tmdtwed-orders', JSON.stringify(updated))
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">Trang Quản Trị (Admin)</h1>
          <p className="text-gray-600">Xin chào, {user.name} ({user.email})</p>
        </div>
        <Link to="/" className="text-sm bg-black text-white px-4 py-2 rounded">
          Xem cửa hàng
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white border rounded shadow-sm">
          <p className="text-gray-500 text-sm">Tổng đơn hàng</p>
          <p className="text-2xl font-bold mt-2">{orders.length}</p>
        </div>
        <div className="p-6 bg-white border rounded shadow-sm">
          <p className="text-gray-500 text-sm">Tài khoản quản trị</p>
          <p className="text-2xl font-bold mt-2 text-green-600">Đang hoạt động</p>
        </div>
        <div className="p-6 bg-white border rounded shadow-sm">
          <p className="text-gray-500 text-sm">Trạng thái hệ thống</p>
          <p className="text-2xl font-bold mt-2 text-blue-600">Sẵn sàng</p>
        </div>
      </div>

      <div className="bg-white border rounded p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Danh sách Đơn hàng</h2>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có đơn hàng nào.</p>
        ) : (
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
        )}
      </div>
    </div>
  )
}
