'use client'

import { useState } from 'react'
import { Star, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { reviewApi, getAccessToken } from '@/lib/api'
import { ReviewForm } from './review-form'

interface ReviewCardProps {
  review: {
    id: string
    userId: string
    rating: number
    title?: string
    content: string
    isVerified: boolean
    createdAt: string
    user?: { id: string; name: string }
  }
  productId: string
  currentUserId?: string
  onDelete?: (id: string) => void
  onUpdate?: () => void
}

export function ReviewCard({ review, productId, currentUserId, onDelete, onUpdate }: ReviewCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const isOwner = currentUserId && review.userId === currentUserId

  const renderStars = (rating: number) => (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return
    if (!getAccessToken()) return

    setDeleting(true)
    try {
      await reviewApi.delete(review.id)
      onDelete?.(review.id)
    } catch {
      // silent
    } finally {
      setDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <ReviewForm
        productId={productId}
        initialData={{
          id: review.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
        }}
        isEditing
        onCancel={() => setIsEditing(false)}
        onSuccess={() => {
          setIsEditing(false)
          onUpdate?.()
        }}
      />
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium">{review.user?.name || 'Anonymous'}</h4>
              {review.isVerified && (
                <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {renderStars(review.rating)}
              <span>•</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-600"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {review.title && (
          <h5 className="font-medium mb-2">{review.title}</h5>
        )}
        <p className="text-muted-foreground">{review.content}</p>
      </CardContent>
    </Card>
  )
}
