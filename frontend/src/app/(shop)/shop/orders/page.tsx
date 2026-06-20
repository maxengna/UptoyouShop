"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  ChevronRight,
  Search,
  PackageX,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { userApi, ApiError } from "@/lib/api"

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-blue-100 text-blue-700" },
  processing: { label: "Processing", icon: Package, color: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", icon: XCircle, color: "bg-red-100 text-red-700" },
}

const statusDisplayMap: Record<string, string> = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
}

function mapOrder(order: any) {
  const address = order.shippingAddress || {}
  return {
    id: order.orderNumber || order.id.slice(0, 8),
    _id: order.id,
    date: order.createdAt,
    status: statusDisplayMap[order.status] || order.status?.toLowerCase() || "pending",
    total: Number(order.total),
    items: (order.items || []).map((item: any) => ({
      name: item.product?.name || item.productSnapshot?.name || "Product",
      qty: item.quantity,
      price: Number(item.price),
    })),
    address: [address.address1 || address.street, address.city, address.state].filter(Boolean).join(", ") || "—",
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await userApi.getOrders({ page, limit })
      if (response.success) {
        setOrders((response.data?.orders || []).map(mapOrder))
        setTotalOrders(response.data?.pagination?.total || 0)
        setTotalPages(response.data?.pagination?.pages || 1)
      } else {
        throw new Error("Failed to fetch orders")
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    const matchesStatus = statusFilter ? order.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  const statusCounts = orders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground mt-1">
              View and track all your orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["delivered", "shipped", "processing", "pending", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setStatusFilter(statusFilter === status ? null : status)
                  setPage(1)
                }}
                className="capitalize"
              >
                {status}
                <span className="ml-1.5 text-xs opacity-70">
                  ({statusCounts[status] || 0})
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchOrders}>Retry</Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <PackageX className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter
                ? "Try adjusting your search or filters"
                : "You haven't placed any orders yet"}
            </p>
            {!searchQuery && !statusFilter && (
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.pending
                const StatusIcon = config.icon
                const statusClass = config.color
                return (
                  <Card key={order._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{order.id}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <Badge className={`${statusClass} border-0`}>
                          <StatusIcon className="h-3.5 w-3.5 mr-1" />
                          {config.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        {order.items.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {item.name}
                              <span className="text-xs ml-1">x{item.qty}</span>
                            </span>
                            <span>${(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total</span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Shipping to: {order.address}
                        </p>
                        <Button variant="ghost" size="sm" className="gap-1" asChild>
                          <Link href={`/shop/orders/${order._id}`}>
                            Details
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
