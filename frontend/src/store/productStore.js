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
            avgRating: Number(p.avg_rating || 0),
            rating: Number(p.avg_rating || 0),
            review_count: Number(p.review_count || 0),
            stock: Number(p.stock ?? 100),
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

  // Cập nhật optimistic tại client ngay lập tức khi Admin thêm / sửa / xóa
  syncProductUpdate: (prod) => {
    set((state) => {
      const exists = state.products.some((p) => p.id === prod.id)
      const newImg = prod.image_url || ''
      const mapped = {
        id: prod.id,
        name: prod.name,
        price: Number(prod.price),
        category: prod.category,
        gender: prod.gender || 'Nam',
        brand: prod.brand || 'Maison',
        description: prod.description || '',
        image_url: newImg,
        images: newImg ? [newImg] : [],
        colors: prod.colors || ['den', 'trang', 'be'],
        sizes: prod.sizes || ['S', 'M', 'L', 'XL'],
        avgRating: Number(prod.avg_rating || 0),
        rating: Number(prod.avg_rating || 0),
        review_count: Number(prod.review_count || 0),
        stock: Number(prod.stock || 100),
      }
      if (exists) {
        return {
          products: state.products.map((p) => (p.id === prod.id ? { ...p, ...mapped } : p)),
        }
      }
      return {
        products: [mapped, ...state.products],
      }
    })
  },

  syncProductDelete: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }))
  },
}))

// Auto-fetch on app load
if (typeof window !== 'undefined') {
  useProductStore.getState().fetchProducts()
}
