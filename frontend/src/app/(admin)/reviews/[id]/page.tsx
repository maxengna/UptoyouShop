"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, Loader2, AlertCircle, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { adminReviewApi } from "@/lib/api"

interface ReviewDetail {
  id: string
  productId: string
  userId: string
  rating: number
  title?: string
  content: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: { id: string; name: string; email: string }
  product?: { id: string; name: string; image?: string | null }
}

export default function ReviewDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true)
        const res = await adminReviewApi.getById(params.id as string)
        if (res.success) {
          setReview(res.data)
        } else {
          setError(res.message || "Review not found")
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch review")
      } finally {
        setLoading(false)
      }
    }
    fetchReview()
  }, [params.id])

  const handleToggleActive = async () => {
    if (!review) return
    setToggling(true)
    try {
      const res = await adminReviewApi.toggleActive(review.id)
      if (res.success) {
        setReview((prev) => prev ? { ...prev, isActive: res.data.isActive } : prev)
      }
    } catch {
      // silent
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!review) return
    if (!confirm("Are you sure you want to permanently delete this review?")) return
    setDeleting(true)
    try {
      await adminReviewApi.delete(review.id)
      router.push("/reviews")
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !review) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
        <p className="text-lg font-medium mb-4">{error || "Review not found"}</p>
        <Button asChild>
          <Link href="/reviews">Back to Reviews</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/reviews">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Review Detail</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main review content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Customer Review</CardTitle>
                </div>
                <Badge variant={review.isActive ? 'default' : 'secondary'}>
                  {review.isActive ? 'Active' : 'Hidden'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-lg">{review.user?.name || 'Anonymous'}</span>
                  {review.isVerified && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-muted-foreground">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <Separator />

              {review.title && (
                <div>
                  <h3 className="font-semibold text-lg">{review.title}</h3>
                </div>
              )}

              <div>
                <p className="text-muted-foreground whitespace-pre-wrap">{review.content}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p>{new Date(review.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated:</span>
                  <p>{new Date(review.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {review.product?.image ? (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="h-16 w-16 rounded-md object-cover bg-muted"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                  <div>
                    <p className="font-medium line-clamp-2">{review.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">ID: {review.productId}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/products/${review.productId}`}>
                    View Product
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{review.user?.name || 'Anonymous'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{review.user?.email || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">User ID:</span>
                  <p className="font-mono text-xs truncate">{review.userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={review.isActive ? 'secondary' : 'default'}
                className="w-full"
                onClick={handleToggleActive}
                disabled={toggling}
              >
                {toggling ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : review.isActive ? (
                  <XCircle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {review.isActive ? 'Hide Review' : 'Show Review'}
              </Button>

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
