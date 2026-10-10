import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const lineKey = (item) => `${item.productId}-${item.size}-${item.color}`

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const key = lineKey(item)
        const existing = get().items.find((i) => lineKey(i) === key)
        if (existing) {
          set({
            items: get().items.map((i) =>
              lineKey(i) === key ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          })
        } else {
          set({ items: [...get().items, item] })
        }
      },

      removeItem: (key) => set({ items: get().items.filter((i) => lineKey(i) !== key) }),

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return
        set({
          items: get().items.map((i) => (lineKey(i) === key ? { ...i, quantity } : i)),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () => get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    { name: 'tmdtwed-cart' }
  )
)

export { lineKey }
