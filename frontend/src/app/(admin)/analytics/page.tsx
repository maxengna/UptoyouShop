"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api";
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
  BarChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered": return "bg-green-100 text-green-800";
    case "processing": return "bg-blue-100 text-blue-800";
    case "shipped": return "bg-yellow-100 text-yellow-800";
    case "pending": return "bg-gray-100 text-gray-800";
    case "cancelled": return "bg-red-100 text-red-800";
    case "refunded": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAnalyticsOverview(period);
      if (res.success) setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeIcon = (v: number) =>
    v >= 0
      ? <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
      : <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="h-8 w-8 text-red-500 mb-4" />
      <p className="text-red-500">{error}</p>
      <Button variant="outline" className="mt-4" onClick={fetchData}>Retry</Button>
    </div>
  );

  if (!data) return null;

  const salesChartData = data.salesByDay.map((d: any) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const stockData = [
    { name: "In Stock", value: data.totalProducts - data.lowStockProducts - data.outOfStockProducts },
    { name: "Low Stock", value: data.lowStockProducts },
    { name: "Out of Stock", value: data.outOfStockProducts },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Understand your store performance</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatPrice(data.totalRevenue), change: data.revenueChange, icon: DollarSign },
          { label: "Total Orders", value: data.totalOrders.toLocaleString(), change: data.ordersChange, icon: ShoppingCart },
          { label: "Avg Order Value", value: formatPrice(data.averageOrderValue), change: null, icon: TrendingUp },
          { label: "Total Customers", value: data.totalCustomers.toLocaleString(), change: data.customersChange, icon: Users },
          { label: "Total Products", value: data.totalProducts.toLocaleString(), change: data.productsChange, icon: Package },
        ].map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{card.value}</div>
              {card.change !== null && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {changeIcon(card.change)}
                  {card.change >= 0 ? "+" : ""}{card.change}%
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Sales Trends + Product Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[hsl(var(--chart-1))]" />
              Sales Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis yAxisId="revenue" tick={{ fontSize: 12 }} className="text-muted-foreground"
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      formatter={(value, name) => [
                        name === "Revenue" ? `$${Number(value).toLocaleString()}` : value,
                        name,
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="orders" dataKey="orders" name="Orders" fill={chartColors[0]} opacity={0.15} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue"
                      stroke={chartColors[0]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No sales data</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[hsl(var(--chart-2))]" />
              Product Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stockData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                    {stockData.map((_, i) => (
                      <Cell key={i} fill={chartColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                {stockData.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors[i] }} />
                    {s.name}: {s.value}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Products + Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[hsl(var(--chart-3))]" />
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts.map((p: any) => ({ ...p, shortName: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name }))}
                    layout="vertical" margin={{ left: 0, right: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground"
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="shortName" tick={{ fontSize: 12 }} className="text-muted-foreground" width={130} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 13 }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill={chartColors[2]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">No data</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[hsl(var(--chart-3))]" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCustomers.length > 0 ? data.topCustomers.map((c: any, i: number) => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <p className="font-medium">{c.name || "Unknown"}</p>
                      <p className="text-sm text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatPrice(c.totalSpent)}</p>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-8">No customer data</p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold">{data.totalCustomers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{data.newCustomers}</p>
                <p className="text-xs text-muted-foreground">New (30d)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{data.activeCustomers}</p>
                <p className="text-xs text-muted-foreground">Active (30d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Top Rated + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[hsl(var(--chart-4))]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Top Rated Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topRatedProducts.length > 0 ? data.topRatedProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <svg className="h-3 w-3 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        {p.averageRating.toFixed(1)} ({p.reviewsCount} reviews)
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-muted-foreground text-center py-8">No ratings yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Recent Orders
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatPrice(order.amount)}</p>
                    <p className="text-xs text-muted-foreground">{order.items} items</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
