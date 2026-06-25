'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { reviewApi } from '@/lib/api'
import { getAccessToken } from '@/lib/api'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: {
    id: string
    rating: number
    title?: string
    content: string
  }
  isEditing?: boolean
}

export function ReviewForm({ productId, onSuccess, onCancel, initialData, isEditing }: ReviewFormProps) {
  const [rating, setRating] = useState(initialData?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState(initialData?.title || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    if (!content.trim()) {
      setError('Please write a review')
      return
    }

    const token = getAccessToken()
    if (!token) {
      setError('Please login to submit a review')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isEditing && initialData) {
        await reviewApi.update(initialData.id, { rating, title: title || undefined, content })
      } else {
        await reviewApi.create({ productId, rating, title: title || undefined, content })
      }
      setRating(0)
      setTitle('')
      setContent('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-6 bg-card">
      <h3 className="font-semibold text-lg">
        {isEditing ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 transition-colors"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium mb-2">
          Title (optional)
        </label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summary of your review"
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="review-content" className="block text-sm font-medium mb-2">
          Review
        </label>
        <Textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
