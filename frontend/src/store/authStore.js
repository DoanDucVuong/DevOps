import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginUser, registerUser } from '../api/client'

// Luôn sử dụng Backend thật (JWT, SQLite DB)
const USE_BACKEND = true

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      users: [], // chỉ dùng ở chế độ LocalStorage

      register: async ({ name, fullName, email, password }) => {
        const finalName = fullName || name
        if (USE_BACKEND) {
          try {
            const data = await registerUser({ fullName: finalName, email, password })
            localStorage.setItem('sttn-token', data.token)
            set({ user: data.user, token: data.token })
            return { success: true }
          } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Đăng ký thất bại.' }
          }
        }
        if (get().users.some((u) => u.email === email)) {
          return { success: false, message: 'Email này đã được đăng ký.' }
        }
        set({
          users: [...get().users, { name: finalName, email, password }],
          user: { id: email, name: finalName, email },
        })
        return { success: true }
      },

      login: async ({ email, password }) => {
        if (USE_BACKEND) {
          try {
            const data = await loginUser({ email, password })
            localStorage.setItem('sttn-token', data.token)
            set({ user: data.user, token: data.token })
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
        return { success: true, user: u }
      },

      logout: () => {
        localStorage.removeItem('sttn-token')
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
