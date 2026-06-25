"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Search, Eye, Star, Loader2, AlertCircle, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { adminReviewApi } from "@/lib/api"

interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  title?: string
  content: string
  isVerified: boolean
  isActive: boolean
  createdAt: string
  user?: { id: string; name: string; email: string }
  product?: { id: string; name: string; image?: string | null }
}

const RATING_OPTIONS = ["All", "5", "4", "3", "2", "1"]
const STATUS_OPTIONS = ["All", "Active", "Hidden"]

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [selectedRating, setSelectedRating] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    pages: number
  } | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const LIMIT = 10

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminReviewApi.getAll({
        page: currentPage,
        limit: LIMIT,
        rating: selectedRating === "All" ? undefined : Number(selectedRating),
        isActive: selectedStatus === "All" ? undefined : selectedStatus === "Active" ? "true" : "false",
        search: searchQuery || undefined,
      })
      if (response.success) {
        setReviews(response.data.reviews || [])
        setPagination(response.data.pagination || null)
      } else {
        setError(response.message || "Failed to fetch reviews")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchQuery, selectedRating, selectedStatus])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleSearch = () => {
    setCurrentPage(1)
    setSearchQuery(searchInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleToggleActive = async (id: string) => {
    setTogglingId(id)
    try {
      const res = await adminReviewApi.toggleActive(id)
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isActive: res.data.isActive } : r))
        )
      }
    } catch {
      // silent
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return
    setDeletingId(id)
    try {
      const res = await adminReviewApi.delete(id)
      if (res.success) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null)
    }
  }

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reviews</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by content, title, or customer name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">Search</Button>
            </div>

            <select
              value={selectedRating}
              onChange={(e) => { setSelectedRating(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>Rating: {opt}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1) }}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 mb-4 p-3 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No reviews found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Product</th>
                    <th className="text-left py-3 px-2 font-medium">Customer</th>
                    <th className="text-left py-3 px-2 font-medium">Rating</th>
                    <th className="text-left py-3 px-2 font-medium">Content</th>
                    <th className="text-center py-3 px-2 font-medium">Status</th>
                    <th className="text-center py-3 px-2 font-medium">Verified</th>
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                    <th className="text-right py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <Link href={`/reviews/${review.id}`} className="font-medium hover:text-primary line-clamp-1 max-w-[200px] block">
                          {review.product?.name || 'Unknown Product'}
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <span className="line-clamp-1 max-w-[150px] block">
                          {review.user?.name || review.user?.email || 'Anonymous'}
                        </span>
                      </td>
                      <td className="py-3 px-2">{renderStars(review.rating)}</td>
                      <td className="py-3 px-2">
                        <span className="line-clamp-1 max-w-[250px] block text-muted-foreground">
                          {review.title ? `${review.title} — ` : ''}{review.content}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant={review.isActive ? 'default' : 'secondary'}>
                          {review.isActive ? 'Active' : 'Hidden'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {review.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href={`/reviews/${review.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleActive(review.id)}
                            disabled={togglingId === review.id}
                          >
                            {togglingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : review.isActive ? (
                              <XCircle className="h-4 w-4 text-amber-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(review.id)}
                            disabled={deletingId === review.id}
                          >
                            {deletingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pagination.pages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
