// src/store/cartStore.js — Estado global del carrito con Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const { items } = get()
        const existing = items.find((i) => i.id === product.id)
        const maxQty = product.stock || 999

        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: Math.min(maxQty, i.quantity + quantity) }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                stock: product.stock,
                imageUrl: product.media?.[0]?.url || null,
                quantity: Math.min(quantity, maxQty),
              },
            ],
          })
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.id !== id) })
          return
        }
        set({
          items: get().items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.min(i.stock || 999, quantity) }
              : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      },
    }),
    { name: 'movilcenter-cart' }
  )
)

export default useCartStore
