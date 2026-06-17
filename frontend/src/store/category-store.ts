import { create } from 'zustand'
import { categoryApi } from '@/lib/api'

export interface CategoryNav {
  id: string
  name: string
  slug: string
}

interface CategoryStore {
  categories: CategoryNav[]
  loading: boolean
  fetched: boolean
  fetchCategories: () => Promise<void>
  refreshCategories: () => Promise<void>
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  categories: [],
  loading: false,
  fetched: false,

  fetchCategories: async () => {
    if (get().fetched && get().categories.length > 0) return
    set({ loading: true })
    try {
      const res = await categoryApi.getAll()
      const cats = (res.categories || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))
      set({ categories: cats, fetched: true, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  refreshCategories: async () => {
    set({ loading: true, fetched: false })
    try {
      const res = await categoryApi.getAll()
      const cats = (res.categories || []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))
      set({ categories: cats, fetched: true, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))
