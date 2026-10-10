import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) => {
        const exists = get().productIds.includes(productId)
        set({
          productIds: exists
            ? get().productIds.filter((id) => id !== productId)
            : [...get().productIds, productId],
        })
      },

      isWished: (productId) => get().productIds.includes(productId),
      remove: (productId) =>
        set({ productIds: get().productIds.filter((id) => id !== productId) }),
    }),
    { name: 'tmdtwed-wishlist' }
  )
)
