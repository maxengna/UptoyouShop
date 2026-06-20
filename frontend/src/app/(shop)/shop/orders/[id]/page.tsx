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
  CreditCard,
  Loader2,
  PackageX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { orderApi, ApiError } from '@/lib/api'
import { formatPrice } from '@/lib/utils'

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Refunded', icon: XCircle, color: 'bg-red-100 text-red-800' },
}

const statusTimeline = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']

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

export default function CustomerOrderDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderApi.getById(id)
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
          <Link href="/shop/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  const displayStatus = order.status || 'PENDING'
  const StatusIcon = statusConfig[displayStatus]?.icon || Clock
  const statusColorClass = statusConfig[displayStatus]?.color || 'bg-gray-100 text-gray-800'
  const address = order.shippingAddress || {}
  const currentStepIndex = statusTimeline.indexOf(displayStatus)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/shop/orders">
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

        {/* Status Timeline */}
        {displayStatus !== 'CANCELLED' && displayStatus !== 'REFUNDED' && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {statusTimeline.map((step, index) => {
                  const stepConfig = statusConfig[step]
                  const StepIcon = stepConfig.icon
                  const isActive = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex

                  return (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                          isActive
                            ? isCurrent
                              ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                              : 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {stepConfig.label}
                      </span>
                      {isCurrent && order[`${step.toLowerCase()}At`] && (
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {formatDate(order[`${step.toLowerCase()}At`])}
                        </span>
                      )}
                      {index < statusTimeline.length - 1 && (
                        <div
                          className={`absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-0.5 hidden md:block ${
                            index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                          }`}
                          style={{ position: 'relative' }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
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
                  <span className="font-medium capitalize">
                    {statusConfig[displayStatus]?.label || displayStatus.toLowerCase()}
                  </span>
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

            {/* Payment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{Number(order.shipping) === 0 ? 'FREE' : formatPrice(Number(order.shipping))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatPrice(Number(order.tax))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
                {order.currency && (
                  <p className="text-xs text-muted-foreground text-right">{order.currency}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({order.items?.length || 0} items)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item: any) => {
                      const productName = item.product?.name || item.productSnapshot?.name || 'Product'
                      const productImage = item.product?.images?.[0]?.url
                      const itemTotal = Number(item.price) * item.quantity

                      return (
                        <div key={item.id} className="flex gap-4 p-3 rounded-lg border">
                          {productImage ? (
                            <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                              <img
                                src={productImage}
                                alt={productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{productName}</p>
                            {item.variant && (
                              <p className="text-xs text-muted-foreground">
                                {item.variant.name || item.variantId}
                              </p>
                            )}
                            {item.product?.sku && (
                              <p className="text-xs text-muted-foreground font-mono">SKU: {item.product.sku}</p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-sm text-muted-foreground">
                                {formatPrice(Number(item.price))} x {item.quantity}
                              </span>
                              <span className="text-sm font-medium">{formatPrice(itemTotal)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PackageX className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No items in this order</p>
                  </div>
                )}
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
    </div>
  )
}
