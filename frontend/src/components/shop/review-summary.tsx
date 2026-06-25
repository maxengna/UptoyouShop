import { Star } from 'lucide-react'

interface ReviewSummaryProps {
  averageRating: number
  totalReviews: number
  ratingDistribution: Record<number, number>
}

export function ReviewSummary({ averageRating, totalReviews, ratingDistribution }: ReviewSummaryProps) {
  const renderStars = (rating: number) => (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )

  const maxCount = Math.max(...Object.values(ratingDistribution), 1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="text-center">
        <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center mb-2">{renderStars(averageRating)}</div>
        <p className="text-sm text-muted-foreground">
          Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = ratingDistribution[stars] || 0
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm w-8">{stars}★</span>
              <div className="flex-1 bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
