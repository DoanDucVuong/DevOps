import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api, { loginUser, registerUser } from '../api/client'
import { useCartStore } from './cartStore'
import { useWishlistStore } from './wishlistStore'

// Luôn sử dụng Backend thật (JWT, SQLite DB)
const USE_BACKEND = true

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      users: [], // chỉ dùng ở chế độ LocalStorage

      fetchUserData: async (user) => {
        if (!user) return
        const userKey = user.id || user.email

        let userCart = null
        let userWishlist = null

        // 1. Cố gắng gọi API backend lấy giỏ hàng / wishlist nếu hệ thống có endpoint
        try {
          const res = await api.get('/cart')
          if (res?.data && Array.isArray(res.data)) {
            userCart = res.data
          }
        } catch (_) {}

        try {
          const res = await api.get('/wishlist')
          if (res?.data && Array.isArray(res.data)) {
            userWishlist = res.data
          }
        } catch (_) {}

        // 2. Nếu không có từ backend, lấy từ bộ nhớ riêng biệt của user trong localStorage
        if (!userCart) {
          try {
            const saved = localStorage.getItem(`user-cart-${userKey}`)
            if (saved) userCart = JSON.parse(saved)
          } catch (_) {}
        }

        if (!userWishlist) {
          try {
            const saved = localStorage.getItem(`user-wishlist-${userKey}`)
            if (saved) userWishlist = JSON.parse(saved)
          } catch (_) {}
        }

        // 3. Đè lên state hiện tại của Cart và Wishlist
        if (userCart && Array.isArray(userCart)) {
          useCartStore.getState().setCart(userCart)
        } else {
          useCartStore.getState().clearCart()
        }

        if (userWishlist && Array.isArray(userWishlist)) {
          useWishlistStore.getState().setWishlist(userWishlist)
        } else {
          useWishlistStore.getState().clearWishlist()
        }
      },

      register: async ({ name, fullName, email, password }) => {
        const finalName = fullName || name
        if (USE_BACKEND) {
          try {
            const data = await registerUser({ fullName: finalName, email, password })
            localStorage.setItem('sttn-token', data.token)
            set({ user: data.user, token: data.token })
            useCartStore.getState().clearCart()
            useWishlistStore.getState().clearWishlist()
            return { success: true }
          } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Đăng ký thất bại.' }
          }
        }
        if (get().users.some((u) => u.email === email)) {
          return { success: false, message: 'Email này đã được đăng ký.' }
        }
        const u = { id: email, name: finalName, email }
        set({
          users: [...get().users, { name: finalName, email, password }],
          user: u,
        })
        useCartStore.getState().clearCart()
        useWishlistStore.getState().clearWishlist()
        return { success: true }
      },

      login: async ({ email, password }) => {
        if (USE_BACKEND) {
          try {
            const data = await loginUser({ email, password })
            localStorage.setItem('sttn-token', data.token)
            set({ user: data.user, token: data.token })

            // Khôi phục / fetch lại Giỏ hàng và Wishlist mới nhất của user vừa đăng nhập
            await get().fetchUserData(data.user)

            return { success: true, user: data.user }
          } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Đăng nhập thất bại.' }
          }
        }
        const found = get().users.find((u) => u.email === email && u.password === password)
        if (!found) return { success: false, message: 'Email hoặc mật khẩu không đúng.' }
        const u = {
          id: email,
          name: found.name,
          email: found.email,
          role: found.role || (email.toLowerCase().includes('admin') ? 'admin' : 'customer'),
        }
        set({ user: u })
        await get().fetchUserData(u)
        return { success: true, user: u }
      },

      logout: () => {
        const currentUser = get().user
        if (currentUser?.id || currentUser?.email) {
          const userKey = currentUser.id || currentUser.email
          try {
            // Lưu lại giỏ hàng và wishlist của user trước khi xóa
            const currentCart = useCartStore.getState().items
            const currentWishlist = useWishlistStore.getState().productIds
            localStorage.setItem(`user-cart-${userKey}`, JSON.stringify(currentCart))
            localStorage.setItem(`user-wishlist-${userKey}`, JSON.stringify(currentWishlist))
          } catch (e) {
            console.warn('Lỗi khi sao lưu dữ liệu user:', e)
          }
        }

        // BẮT BUỘC dọn dẹp state của Giỏ hàng và Wishlist
        useCartStore.getState().clearCart()
        useWishlistStore.getState().clearWishlist()

        // Xóa token và các key lưu trữ trong localStorage
        localStorage.removeItem('sttn-token')
        localStorage.removeItem('tmdtwed-cart')
        localStorage.removeItem('tmdtwed-wishlist')
        localStorage.removeItem('maison-cart')
        localStorage.removeItem('maison-wishlist')
        localStorage.removeItem('cart-storage')
        localStorage.removeItem('wishlist-storage')

        // Xóa thông tin user
        set({ user: null, token: null })
      },

      updateUser: (updatedData) => {
        const current = get().user || {}
        set({ user: { ...current, ...updatedData } })
      },
    }),
    { name: 'sttn-auth' }
  )
)
