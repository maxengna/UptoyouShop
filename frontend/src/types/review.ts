export interface Review {
  id: string
  productId: string
  userId: string
  orderId?: string
  rating: number
  title?: string
  content: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
  }
  product?: {
    id: string
    name: string
    image?: string | null
  }
}

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export interface ReviewPagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface CreateReviewData {
  productId: string
  orderId?: string
  rating: number
  title?: string
  content: string
}
