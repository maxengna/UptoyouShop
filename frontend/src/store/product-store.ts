import { create } from 'zustand'
import { Product, Category } from '@/types/product'

interface ProductStore {
  products: Product[]
  categories: Category[]
  featuredProducts: Product[]
  isLoading: boolean
  searchQuery: string
  selectedCategory: string
  sortBy: 'price-asc' | 'price-desc' | 'popularity' | 'newest'
  priceRange: [number, number]
  
  setProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setFeaturedProducts: (products: Product[]) => void
  setLoading: (isLoading: boolean) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setSortBy: (sortBy: 'price-asc' | 'price-desc' | 'popularity' | 'newest') => void
  setPriceRange: (range: [number, number]) => void
  getFilteredProducts: () => Product[]
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  categories: [],
  featuredProducts: [],
  isLoading: false,
  searchQuery: '',
  selectedCategory: '',
  sortBy: 'popularity',
  priceRange: [0, 1000],

  setProducts: (products: Product[]) => {
    set({ products })
  },

  setCategories: (categories: Category[]) => {
    set({ categories })
  },

  setFeaturedProducts: (featuredProducts: Product[]) => {
    set({ featuredProducts })
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading })
  },

  setSearchQuery: (searchQuery: string) => {
    set({ searchQuery })
  },

  setSelectedCategory: (selectedCategory: string) => {
    set({ selectedCategory })
  },

  setSortBy: (sortBy: 'price-asc' | 'price-desc' | 'popularity' | 'newest') => {
    set({ sortBy })
  },

  setPriceRange: (priceRange: [number, number]) => {
    set({ priceRange })
  },

  getFilteredProducts: () => {
    const { products, searchQuery, selectedCategory, sortBy, priceRange } = get()
    
    let filtered = products

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'newest':
          return b.id.localeCompare(a.id) // Assuming newer products have higher IDs
        case 'popularity':
        default:
          return (b.rating || 0) - (a.rating || 0)
      }
    })

    return filtered
  },
}))
