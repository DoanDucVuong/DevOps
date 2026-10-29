import { create } from 'zustand'

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('maison-theme')
  if (saved === 'dark' || saved === 'light') return saved
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const applyThemeToDOM = (theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark')
    root.setAttribute('data-theme', 'light')
  }
}

// Khởi chạy ngay khi load module để chống nhấp nháy sáng/tối
if (typeof window !== 'undefined') {
  applyThemeToDOM(getInitialTheme())
}

export const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark'
    applyThemeToDOM(nextTheme)
    localStorage.setItem('maison-theme', nextTheme)
    set({ theme: nextTheme })
  },

  setTheme: (newTheme) => {
    if (newTheme !== 'light' && newTheme !== 'dark') return
    applyThemeToDOM(newTheme)
    localStorage.setItem('maison-theme', newTheme)
    set({ theme: newTheme })
  },
}))
