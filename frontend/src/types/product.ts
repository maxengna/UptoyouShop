export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  slug: string
  stock: number
  sku: string
  variants?: ProductVariant[]
  rating?: number
  reviews?: number
  isNew?: boolean
  isOnSale?: boolean
  discountPercentage?: number
}

export interface ProductVariant {
  id: string
  name: string
  value: string
  price?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  description?: string
  productCount?: number
}
