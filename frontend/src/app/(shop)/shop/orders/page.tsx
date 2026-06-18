"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"

// Mock order data
const mockOrders = [
  {
    id: "ORD-001",
    date: "2024-12-15",
    status: "delivered",
    total: 156.80,
    items: [
      { name: "Wireless Headphones", qty: 1, price: 79.99 },
      { name: "USB-C Cable", qty: 2, price: 12.99 },
      { name: "Phone Case", qty: 1, price: 29.99 },
    ],
    address: "123 Main St, New York, NY 10001",
  },
  {
    id: "ORD-002",
    date: "2025-01-20",
    status: "shipped",
    total: 245.50,
    items: [
      { name: "Mechanical Keyboard", qty: 1, price: 149.99 },
      { name: "Mouse Pad", qty: 1, price: 24.99 },
      { name: "Webcam", qty: 1, price: 70.52 },
    ],
    address: "456 Oak Ave, Los Angeles, CA 90001",
  },
  {
    id: "ORD-003",
    date: "2025-02-10",
    status: "pending",
    total: 89.97,
    items: [
      { name: "Smart Watch Band", qty: 3, price: 29.99 },
    ],
    address: "789 Pine Rd, Chicago, IL 60601",
  },
  {
    id: "ORD-004",
    date: "2024-11-05",
    status: "cancelled",
    total: 199.99,
    items: [
      { name: "Bluetooth Speaker", qty: 1, price: 199.99 },
    ],
    address: "321 Elm St, Houston, TX 77001",
  },
  {
    id: "ORD-005",
    date: "2024-10-28",
    status: "delivered",
    total: 534.25,
    items: [
      { name: "Laptop Stand", qty: 1, price: 89.99 },
      { name: "Monitor", qty: 1, price: 349.99 },
      { name: "HDMI Cable", qty: 2, price: 15.99 },
      { name: "Surge Protector", qty: 1, price: 62.29 },
    ],
    address: "654 Maple Dr, Boston, MA 02101",
  },
]

type OrderStatus = "delivered" | "shipped" | "pending" | "cancelled"

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string }> = {
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-blue-100 text-blue-700" },
  pending: { label: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-700" },
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    const matchesStatus = statusFilter ? order.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  const statusCounts = mockOrders.reduce(
    (acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted-foreground mt-1">
            View and track all your orders
          </p>
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
            {["delivered", "shipped", "pending", "cancelled"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setStatusFilter(statusFilter === status ? null : status)
                }
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
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
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status as OrderStatus].icon
              const statusClass = statusConfig[order.status as OrderStatus].color
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
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
                        {statusConfig[order.status as OrderStatus].label}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
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
                      <Button variant="ghost" size="sm" className="gap-1">
                        Details
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
