import { create } from 'zustand'
import { fetchProducts } from '../api/client'
import { products as defaultProducts, getProductById as defaultGetProductById } from '../data/products'

export const useProductStore = create((set, get) => ({
  products: defaultProducts,
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true })
    try {
      const res = await fetchProducts({ limit: 500 })
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        // Map database row into frontend product format
        const mapped = res.items.map((p) => {
          const fallback = defaultGetProductById(p.id) || {}
          return {
            ...fallback,
            ...p,
            id: p.id,
            name: p.name,
            description: p.description || fallback.description || '',
            category: p.category,
            gender: p.gender || fallback.gender || 'Nam',
            brand: p.brand || fallback.brand || 'Maison',
            price: Number(p.price),
            image_url: p.image_url || fallback.images?.[0] || '',
            images: p.image_url ? [p.image_url, ...(fallback.images?.slice(1) || [])] : (fallback.images || []),
            colors: fallback.colors || ['den', 'trang', 'be'],
            sizes: fallback.sizes || ['S', 'M', 'L', 'XL'],
            avgRating: Number(p.avg_rating || fallback.avgRating || 4.5),
            stock: Number(p.stock || 100),
          }
        })
        set({ products: mapped, isLoading: false })
      } else {
        set({ products: defaultProducts, isLoading: false })
      }
    } catch {
      set({ products: defaultProducts, isLoading: false })
    }
  },

  getProductById: (id) => {
    const list = get().products
    return list.find((p) => p.id === id) || defaultGetProductById(id)
  },

  // Cập nhật optimistic tại client ngay khi Admin sửa
  syncProductUpdate: (updatedProd) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === updatedProd.id ? { ...p, ...updatedProd, images: [updatedProd.image_url || p.image_url] } : p))
    }))
  },

  syncProductDelete: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id)
    }))
  },
}))

// Auto-fetch on app load
if (typeof window !== 'undefined') {
  useProductStore.getState().fetchProducts()
}
