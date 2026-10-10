import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Đơn hàng lưu cục bộ — chỉ dùng khi chạy KHÔNG có Backend (frontend độc lập).
export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
    }),
    { name: 'sttn-orders' }
  )
)
