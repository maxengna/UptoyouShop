'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminApi, ApiError } from '@/lib/api'

const statusFilterOptions = ['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled']
const paymentMethodFilterOptions = ['All', 'Credit Card', 'PayPal', 'Apple Pay', 'Google Pay']

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

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />
    case 'processing':
      return <Package className="h-4 w-4" />
    case 'shipped':
      return <Truck className="h-4 w-4" />
    case 'completed':
      return <CheckCircle className="h-4 w-4" />
    case 'cancelled':
    case 'refunded':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function mapOrderFromApi(order: any) {
  const address = order.shippingAddress || {}
  const itemsCount = order.items?.length || 0
  const displayStatus = statusDisplayMap[order.status] || order.status.toLowerCase()

  return {
    id: order.orderNumber || order.id,
    _id: order.id,
    customer: {
      name: order.user?.name || `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Guest',
      email: order.user?.email || address.email || '',
      phone: address.phone || '',
    },
    date: order.createdAt,
    amount: Number(order.total),
    status: displayStatus,
    items: itemsCount,
    paymentMethod: order.paymentMethod || 'N/A',
    shippingAddress: {
      street: address.address1 || address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || '',
    },
    products: (order.items || []).map((item: any) => ({
      name: item.product?.name || item.productSnapshot?.name || 'Product',
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const ordersPerPage = 10

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const apiStatus = selectedStatus === 'All' ? undefined : (statusApiMap[selectedStatus.toLowerCase()] || selectedStatus.toUpperCase())
      const response = await adminApi.getOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: apiStatus,
      })
      const rawOrders = response.data?.orders || []
      setOrders(rawOrders.map(mapOrderFromApi))
      setTotalOrders(response.data?.pagination?.total || 0)
      setTotalPages(response.data?.pagination?.pages || 1)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load orders. Please try again.')
      }
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      !searchQuery ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPayment = selectedPaymentMethod === 'All' || order.paymentMethod === selectedPaymentMethod

    return matchesSearch && matchesPayment
  })

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    try {
      const apiStatus = statusApiMap[newStatus] || newStatus.toUpperCase()
      await adminApi.updateOrderStatus(orderId, apiStatus)
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      )
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to update status: ${err.message}`)
      } else {
        alert('Failed to update status. Please try again.')
      }
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to process a refund for this order?')) return
    setUpdatingOrderId(orderId)
    try {
      await adminApi.updateOrderStatus(orderId, 'REFUNDED')
      setOrders(prev =>
        prev.map(o =>
          o._id === orderId ? { ...o, status: 'refunded' } : o
        )
      )
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to process refund: ${err.message}`)
      } else {
        alert('Failed to process refund. Please try again.')
      }
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const stats = {
    total: totalOrders,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    completed: orders.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders and fulfillment
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/analytics">
            View Analytics
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-sm text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.shipped}</div>
            <p className="text-sm text-muted-foreground">Shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {statusFilterOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Payment Method Filter */}
              <div className="relative">
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="appearance-none bg-background border border-input rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {paymentMethodFilterOptions.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-muted-foreground" />
              </div>

              {/* Export Button */}
              <Button variant="outline">
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Orders ({totalOrders})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchOrders}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Order ID</th>
                      <th className="text-left p-4 font-medium">Customer</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Payment</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Items</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{new Date(order.date).toLocaleDateString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.shippingAddress.city}, {order.shippingAddress.state}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 font-medium">{formatPrice(order.amount)}</td>
                        <td className="p-4">{order.paymentMethod}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(order.status)}
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">{order.items}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/orders/${order._id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            {updatingOrderId === order._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <>
                                {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'refunded' && (
                                  <div className="relative">
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                      className="text-xs border border-input rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-ring"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="processing">Processing</option>
                                      <option value="shipped">Shipped</option>
                                      <option value="completed">Completed</option>
                                      <option value="cancelled">Cancelled</option>
                                    </select>
                                  </div>
                                )}

                                {order.status === 'completed' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRefund(order._id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Refund
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No orders found matching your criteria.</p>
                  <Button variant="outline" onClick={() => {
                    setSearchQuery('')
                    setSelectedStatus('All')
                    setSelectedPaymentMethod('All')
                  }}>
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
