'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Minus, Plus, Star, Truck, Shield, RotateCcw, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Product } from '@/types/product'
import { productApi, reviewApi, getAccessToken } from '@/lib/api'
import { ReviewSummary } from '@/components/shop/review-summary'
import { ReviewCard } from '@/components/shop/review-card'
import { ReviewForm } from '@/components/shop/review-form'

interface ReviewData {
  id: string
  userId: string
  rating: number
  title?: string
  content: string
  isVerified: boolean
  createdAt: string
  user?: { id: string; name: string }
}

interface ReviewStatsData {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const { addItem } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
const [categoryName, setCategoryName] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [reviewStats, setReviewStats] = useState<ReviewStatsData | null>(null)
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotalPages, setReviewTotalPages] = useState(1)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | undefined>()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await productApi.getAll()
        if (response.success && response.data) {
          const found = response.data.products.find((p: any) => {
            const productSlug = p.slug || p.name?.toLowerCase().replace(/\s+/g, '-')
            return productSlug === slug
          })
          if (found) {
            const rawCat = found.category
            const cat = rawCat && typeof rawCat === "object" ? rawCat : {}
            setCategoryName((cat as any).name || "")
            setProduct({
              id: String(found.id ?? ''),
              name: found.name,
              description: found.description || '',
              price: parseFloat(String(found.price)) || 0,
              originalPrice: found.comparePrice ? parseFloat(String(found.comparePrice)) : undefined,
              images: found.images?.map(img => img.url) || [],
              category: (cat as any).slug || "",
              slug: (found as any).slug || found.name.toLowerCase().replace(/\s+/g, '-'),
              stock: parseInt(String(found.stock || '0'), 10),
              sku: found.sku,
              rating: (found as any).rating || undefined,
              reviews: (found as any).reviews || undefined,
              isNew: (found as any).isNew || undefined,
              isOnSale: (found as any).isOnSale || undefined,
              variants: (found as any).variants || undefined,
            })
            setError(null)
          } else {
            setProduct(null)
            setError('Product not found')
          }
        } else {
          setProduct(null)
          setError('Failed to fetch products')
        }
      } catch (err) {
        setProduct(null)
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()

    // Get current user ID from token
    const token = getAccessToken()
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setCurrentUserId(payload.sub || payload.id)
      } catch {
        // ignore
      }
    }
  }, [slug])

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id, reviewPage)
    }
  }, [product?.id, reviewPage])

  const fetchReviews = async (productId: string, page: number) => {
    setReviewsLoading(true)
    try {
      const res = await reviewApi.getProductReviews(productId, page)
      if (res.success && res.data) {
        if (page === 1) {
          setReviews(res.data.reviews)
        } else {
          setReviews((prev) => [...prev, ...res.data.reviews])
        }
        setReviewStats(res.data.stats)
        setReviewTotalPages(res.data.pagination.pages)
      }
    } catch {
      // silent
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleReviewSuccess = () => {
    setShowReviewForm(false)
    if (product) {
      setReviewPage(1)
      fetchReviews(product.id, 1)
    }
  }

  const handleReviewDeleted = (reviewId: string) => {
    setReviews((prev) => prev.filter((r) => r.id !== reviewId))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Button asChild>
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      productName: product.name,
      productImage: product.images[0],
      quantity,
      price: product.price,
      product,
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
      />
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back & Breadcrumb */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            Home
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/category/${product.category}`} className="text-muted-foreground hover:text-primary capitalize">
            {categoryName || product.category}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{product.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || '/images/product-placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-green-500 text-white text-xs px-2 py-1 rounded">
                New
              </span>
            )}
            {product.isOnSale && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                Sale
              </span>
            )}
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square w-20 bg-muted rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'
                  }`}
              >
                <Image
                  src={image || '/images/product-placeholder.jpg'}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {renderStars(product.rating || 0)}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 0} ({product.reviews || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                    Save {formatPrice(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* SKU and Stock */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span>SKU: {product.sku}</span>
              <span>•</span>
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.value)}
                      className={`px-4 py-2 border rounded-md ${selectedVariant === variant.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary'
                        }`}
                    >
                      {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1"
                size="lg"
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span>30-Day Returns</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <Button
                variant="outline"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </Button>
            </div>

            {showReviewForm && (
              <div className="mb-6">
                <ReviewForm
                  productId={product.id}
                  onSuccess={handleReviewSuccess}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {reviewStats && (
              <ReviewSummary
                averageRating={reviewStats.averageRating}
                totalReviews={reviewStats.totalReviews}
                ratingDistribution={reviewStats.ratingDistribution}
              />
            )}

            {/* Individual Reviews */}
            <div className="space-y-6">
              {reviews.length === 0 && !reviewsLoading ? (
                <p className="text-center text-muted-foreground py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    productId={product.id}
                    currentUserId={currentUserId}
                    onDelete={handleReviewDeleted}
                    onUpdate={() => fetchReviews(product.id, reviewPage)}
                  />
                ))
              )}

              {reviewsLoading && (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {reviewPage < reviewTotalPages && (
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => setReviewPage((p) => p + 1)}
                disabled={reviewsLoading}
              >
                Load More Reviews
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
