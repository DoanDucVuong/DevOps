import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Auth giả lập: "đăng ký" lưu user vào danh sách users trong localStorage,
// "đăng nhập" chỉ so khớp email/mật khẩu trong danh sách đó.
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      users: [{ name: 'Quản trị viên', email: 'admin@gmail.com', password: 'admin123', role: 'admin' }],

      register: ({ name, email, password }) => {
        const exists = get().users.some((u) => u.email === email)
        if (exists) return { success: false, message: 'Email này đã được đăng ký.' }
        const newUser = { name, email, password }
        set({ users: [...get().users, newUser], user: { name, email, role: 'user' } })
        return { success: true }
      },

      login: ({ email, password }) => {
        const found = get().users.find((u) => u.email === email && u.password === password)
        if (!found) return { success: false, message: 'Email hoặc mật khẩu không đúng.' }
        set({ user: { name: found.name, email: found.email, role: found.role || 'user' } })
        return { success: true }
      },

      logout: () => set({ user: null }),
    }),
    { name: 'tmdtwed-auth' }
  )
)
