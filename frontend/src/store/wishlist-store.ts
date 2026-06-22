import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userApi } from '@/lib/api'

export interface WishlistProduct {
  id: string
  name: string
  slug: string
  price: number
  originalPrice: number | null
  stock: number
  image: string | null
  category: { name: string; slug: string } | null
}

export interface WishlistItem {
  id: string
  productId: string
  addedAt: string
  product: WishlistProduct
}

interface WishlistStore {
  items: WishlistItem[]
  loading: boolean
  error: string | null
  fetchWishlist: () => Promise<void>
  addItem: (productId: string) => Promise<void>
  removeItem: (wishlistItemId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      fetchWishlist: async () => {
        set({ loading: true, error: null })
        try {
          const response = await userApi.getWishlist()
          if (response.success && response.data) {
            set({ items: response.data.wishlistItems, loading: false })
          } else {
            set({ loading: false })
          }
        } catch (err: any) {
          set({ error: err?.message || 'Failed to load wishlist', loading: false })
        }
      },

      addItem: async (productId: string) => {
        try {
          const response = await userApi.addToWishlist(productId)
          if (response.success) {
            await get().fetchWishlist()
          }
        } catch (err: any) {
          set({ error: err?.message || 'Failed to add item' })
          throw err
        }
      },

      removeItem: async (wishlistItemId: string) => {
        try {
          const response = await userApi.removeFromWishlist(wishlistItemId)
          if (response.success) {
            set({ items: get().items.filter((item) => item.id !== wishlistItemId) })
          }
        } catch (err: any) {
          set({ error: err?.message || 'Failed to remove item' })
          throw err
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId)
      },
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
)
