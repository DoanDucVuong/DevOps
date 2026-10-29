import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/common/Toast'
import { fetchMyOrders } from '../../api/client'

import ProfileSidebar from './ProfileSidebar'
import TabUserInfo from './TabUserInfo'
import TabOrderHistory from './TabOrderHistory'
import TabAddresses from './TabAddresses'
import TabVouchers from './TabVouchers'
import TabLoyalty from './TabLoyalty'
import TabNotifications from './TabNotifications'

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { showToast } = useToast()

  // Đồng bộ tab từ URL search params: ?tab=orders, ?tab=personal-info, etc.
  const initialTab = searchParams.get('tab') || 'personal-info'
  const [activeTab, setActiveTab] = useState(
    initialTab === 'order-history' ? 'orders' : initialTab
  )

  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // Tải danh sách đơn hàng để tính toán chi tiêu và truyền vào các Tab
  useEffect(() => {
    let isMounted = true
    setLoadingOrders(true)

    fetchMyOrders()
      .then((data) => {
        if (!isMounted) return
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        console.warn('[Profile] Không thể tải đơn hàng:', err?.message)
      })
      .finally(() => {
        if (isMounted) setLoadingOrders(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Cập nhật tab khi searchParams thay đổi
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab')
    if (tabFromUrl) {
      setActiveTab(tabFromUrl === 'order-history' ? 'orders' : tabFromUrl)
    }
  }, [searchParams])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const handleLogout = () => {
    logout()
    showToast('Đã đăng xuất tài khoản')
    navigate('/')
  }

  // Tính tổng chi tiêu tích lũy từ các đơn hàng hợp lệ
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 sm:py-10">
      {/* 1. BỐ CỤC CHUNG (LAYOUT): GRID 2 CỘT (md:grid-cols-12 gap-6) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI - SIDEBAR & MEMBER CARD (md:col-span-4 lg:col-span-3) */}
        <div className="md:col-span-4 lg:col-span-3 sticky top-20">
          <ProfileSidebar
            user={user}
            totalSpent={totalSpent}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* CỘT PHẢI - CÁC TAB NỘI DUNG (md:col-span-8 lg:col-span-9) */}
        <div className="md:col-span-8 lg:col-span-9">
          {activeTab === 'personal-info' && (
            <TabUserInfo user={user} onLogout={handleLogout} />
          )}

          {activeTab === 'orders' && (
            <TabOrderHistory orders={orders} loading={loadingOrders} />
          )}

          {activeTab === 'addresses' && (
            <TabAddresses user={user} />
          )}

          {activeTab === 'vouchers' && (
            <TabVouchers />
          )}

          {activeTab === 'loyalty' && (
            <TabLoyalty user={user} totalSpent={totalSpent} />
          )}

          {activeTab === 'notifications' && (
            <TabNotifications />
          )}
        </div>
      </div>
    </div>
  )
}
