"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  Tag,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi, DashboardStats } from "@/lib/api";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0,
    productsChange: 0,
  });
  const [recentOrders, setRecentOrders] = useState<DashboardStats['recentOrders']>([]);
  const [topProducts, setTopProducts] = useState<DashboardStats['topProducts']>([]);
  const [salesData, setSalesData] = useState<DashboardStats['salesData']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getDashboardStats(selectedPeriod);
      if (response.success) {
        setStats({
          totalRevenue: response.data.totalRevenue,
          totalOrders: response.data.totalOrders,
          totalCustomers: response.data.totalCustomers,
          totalProducts: response.data.totalProducts,
          revenueChange: response.data.revenueChange,
          ordersChange: response.data.ordersChange,
          customersChange: response.data.customersChange,
          productsChange: response.data.productsChange,
        });
        setRecentOrders(response.data.recentOrders);
        setTopProducts(response.data.topProducts);
        setSalesData(response.data.salesData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const changeIcon = (value: number) =>
    value >= 0 ? (
      <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
    ) : (
      <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
    );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your store.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button asChild>
            <Link href="/products">Manage Product</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchDashboard}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(stats.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {changeIcon(stats.revenueChange)}
                  {stats.revenueChange >= 0 ? "+" : ""}
                  {stats.revenueChange}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalOrders.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {changeIcon(stats.ordersChange)}
                  {stats.ordersChange >= 0 ? "+" : ""}
                  {stats.ordersChange}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Customers
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCustomers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {changeIcon(stats.customersChange)}
                  {stats.customersChange >= 0 ? "+" : ""}
                  {stats.customersChange}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {changeIcon(stats.productsChange)}
                  {stats.productsChange >= 0 ? "+" : ""}
                  {stats.productsChange}% from last month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sales Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {salesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={salesData.map(d => ({
                          ...d,
                          label: new Date(d.date).toLocaleDateString("en-US", {
                            month: "short", day: "numeric"
                          }),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                          />
                          <YAxis
                            yAxisId="revenue"
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                          />
                          <YAxis
                            yAxisId="orders"
                            orientation="right"
                            tick={{ fontSize: 12 }}
                            className="text-muted-foreground"
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, fontSize: 13 }}
                            formatter={(value, name) => [
                              name === "Revenue" ? `$${Number(value).toLocaleString()}` : value,
                              name,
                            ]}
                          />
                          <Legend />
                          <Bar
                            yAxisId="orders"
                            dataKey="orders"
                            name="Orders"
                            fill="hsl(var(--primary))"
                            opacity={0.15}
                            radius={[4, 4, 0, 0]}
                          />
                          <Line
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center bg-muted rounded-md">
                        <div className="text-center">
                          <TrendingUp className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No sales data available</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders Table */}
              <Card>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/orders">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(order.amount)}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.items} items
                          </p>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topProducts.map((product: any, index: number) => (
                      <div key={product.id} className="flex items-center gap-3">
                        <div className="text-lg font-bold text-muted-foreground w-6">
                          #{index + 1}
                        </div>
                        <div className="relative w-12 h-12 bg-muted rounded-md overflow-hidden">
                          <Image
                            src={product.image || "/images/product-placeholder.jpg"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} sold • {formatPrice(product.revenue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {product.stock} left
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/products">View All Products</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" asChild>
                    <Link href="/products">
                      <Package className="h-4 w-4 mr-2" />
                      Add New Product
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/categories">
                      <Tag className="h-4 w-4 mr-2" />
                      Manage Categories
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/orders">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Manage Orders
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/customers">
                      <Users className="h-4 w-4 mr-2" />
                      View Customers
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/analytics">
                      <Eye className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
