'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  User,
  CreditCard,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { adminApi, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const statusApiMap: Record<string, string> = {
  pending: 'PENDING',
  processing: 'PROCESSING',
  shipped: 'SHIPPED',
  completed: 'DELIVERED',
  cancelled: 'CANCELLED',
  refunded: 'REFUNDED',
}

const statusDisplayMap: Record<string, string> = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
  refunded: { label: 'Refunded', icon: XCircle, color: 'bg-red-100 text-red-800' },
}

function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getOrderById(id)
      if (response.success) {
        setOrder(response.data)
      } else {
        throw new Error('Failed to fetch order')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const apiStatus = statusApiMap[newStatus] || newStatus.toUpperCase()
      await adminApi.updateOrderStatus(id, apiStatus)
      setOrder((prev: any) => ({ ...prev, status: apiStatus }))
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to update status: ${err.message}`)
      } else {
        alert('Failed to update status')
      }
    } finally {
      setUpdating(false)
    }
  }

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to process a refund for this order?')) return
    setUpdating(true)
    try {
      await adminApi.updateOrderStatus(id, 'REFUNDED')
      setOrder((prev: any) => ({ ...prev, status: 'REFUNDED' }))
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to process refund: ${err.message}`)
      } else {
        alert('Failed to process refund')
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <p className="text-destructive">{error || 'Order not found'}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  const displayStatus = statusDisplayMap[order.status] || order.status?.toLowerCase() || 'pending'
  const StatusIcon = statusConfig[displayStatus]?.icon || Clock
  const statusColorClass = statusConfig[displayStatus]?.color || 'bg-gray-100 text-gray-800'
  const address = order.shippingAddress || {}
  const customer = order.user || {}

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              {order.orderNumber || `Order #${order.id?.slice(0, 8)}`}
            </h1>
            <Badge className={`${statusColorClass} border-0`}>
              <StatusIcon className="h-3.5 w-3.5 mr-1" />
              {statusConfig[displayStatus]?.label || displayStatus}
            </Badge>
          </div>
          <p className="text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Package className="h-4 w-4" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">{order.orderNumber || '—'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{displayStatus}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-medium">{order.paymentStatus || '—'}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">{order.paymentMethod || '—'}</span>
              </div>
              {order.trackingNumber && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking #</span>
                    <span className="font-medium font-mono text-xs">{order.trackingNumber}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              {order.shippedAt && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipped</span>
                    <span className="font-medium">{formatDate(order.shippedAt)}</span>
                  </div>
                </>
              )}
              {order.deliveredAt && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivered</span>
                    <span className="font-medium">{formatDate(order.deliveredAt)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{customer.name || `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Guest'}</p>
              {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
              {address.email && !customer.email && <p className="text-muted-foreground">{address.email}</p>}
              {(customer.phone || address.phone) && (
                <p className="text-muted-foreground">{customer.phone || address.phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {address.firstName && address.lastName && (
                <p className="font-medium">{address.firstName} {address.lastName}</p>
              )}
              {address.company && <p className="text-muted-foreground">{address.company}</p>}
              <p className="text-muted-foreground">{address.address1 || address.street || '—'}</p>
              {address.address2 && <p className="text-muted-foreground">{address.address2}</p>}
              <p className="text-muted-foreground">
                {[address.city, address.state, address.zipCode].filter(Boolean).join(', ')}
              </p>
              <p className="text-muted-foreground">{address.country || '—'}</p>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayStatus !== 'completed' && displayStatus !== 'cancelled' && displayStatus !== 'refunded' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <div className="relative">
                    <select
                      value={displayStatus}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      disabled={updating}
                      className="w-full appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
                  </div>
                  {updating && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Updating...
                    </div>
                  )}
                </div>
              )}

              {displayStatus === 'completed' && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={handleRefund}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Process Refund'
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Product</th>
                        <th className="text-left p-3 font-medium">SKU</th>
                        <th className="text-center p-3 font-medium">Qty</th>
                        <th className="text-right p-3 font-medium">Price</th>
                        <th className="text-right p-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item: any) => {
                        const productName = item.product?.name || item.productSnapshot?.name || 'Product'
                        const productImage = item.product?.images?.[0]?.url
                        const sku = item.product?.sku || '—'
                        const itemTotal = Number(item.price) * item.quantity

                        return (
                          <tr key={item.id} className="border-b hover:bg-muted/50">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                {productImage && (
                                  <div className="w-10 h-10 rounded bg-muted overflow-hidden flex-shrink-0">
                                    <img
                                      src={productImage}
                                      alt={productName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-sm">{productName}</p>
                                  {item.variant && (
                                    <p className="text-xs text-muted-foreground">
                                      Variant: {item.variant.name || item.variantId}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground font-mono">{sku}</td>
                            <td className="p-3 text-center text-sm">{item.quantity}</td>
                            <td className="p-3 text-right text-sm">{formatPrice(Number(item.price))}</td>
                            <td className="p-3 text-right font-medium">{formatPrice(itemTotal)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No items in this order</p>
              )}
            </CardContent>
          </Card>

          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-sm ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{Number(order.shipping) === 0 ? 'FREE' : formatPrice(Number(order.shipping))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(Number(order.tax))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
                {order.currency && (
                  <p className="text-xs text-muted-foreground text-right">{order.currency}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
