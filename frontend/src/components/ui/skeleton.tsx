import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-muted rounded w-20 animate-pulse" />
          <div className="h-8 bg-muted rounded w-20 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Product List Skeleton
export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Hero Banner Skeleton
export function HeroBannerSkeleton() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-muted animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div className="max-w-4xl px-4 space-y-4">
          <div className="h-12 bg-muted rounded w-3/4 mx-auto animate-pulse" />
          <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse" />
          <div className="h-10 bg-muted rounded w-32 mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border overflow-hidden group cursor-pointer transition-transform hover:scale-105">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 text-center space-y-2">
        <div className="h-6 bg-muted rounded w-3/4 mx-auto animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 mx-auto animate-pulse" />
      </div>
    </div>
  )
}

// Cart Item Skeleton
export function CartItemSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-muted rounded-md animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 bg-muted rounded w-8 animate-pulse" />
            <div className="h-4 bg-muted rounded w-8 animate-pulse" />
            <div className="h-8 bg-muted rounded w-8 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Order Skeleton
export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24 animate-pulse" />
          <div className="h-3 bg-muted rounded w-32 animate-pulse" />
          <div className="h-3 bg-muted rounded w-20 animate-pulse" />
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 bg-muted rounded w-20 animate-pulse ml-auto" />
          <div className="h-6 bg-muted rounded w-16 animate-pulse ml-auto" />
        </div>
      </div>
    </div>
  )
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </div>
    </div>
  )
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Chart Skeleton */}
      <div className="bg-white rounded-lg border p-6">
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }, (_, i) => (
            <TableRowSkeleton key={i} columns={4} />
          ))}
        </div>
      </div>
    </div>
  )
}
