import { create } from 'zustand'
import { fetchCategories } from '../api/client'
import { categories as defaultCategories } from '../data/categories'

export const useCategoryStore = create((set, get) => ({
  categories: defaultCategories,
  isLoading: false,

  fetchCategories: async () => {
    set({ isLoading: true })
    try {
      const data = await fetchCategories()
      if (Array.isArray(data) && data.length > 0) {
        set({ categories: data, isLoading: false })
      } else {
        set({ categories: defaultCategories, isLoading: false })
      }
    } catch {
      set({ categories: defaultCategories, isLoading: false })
    }
  }
}))

// Auto-fetch on app load
if (typeof window !== 'undefined') {
  useCategoryStore.getState().fetchCategories()
}
