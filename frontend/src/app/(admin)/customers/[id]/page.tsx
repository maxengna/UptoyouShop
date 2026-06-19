"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, ShoppingCart, DollarSign, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminApi } from "@/lib/api";

const roleBadgeVariant = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return "destructive" as const;
    case "ADMIN":
      return "secondary" as const;
    default:
      return "default" as const;
  }
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "default" as const;
    case "SHIPPED":
      return "secondary" as const;
    case "PAID":
      return "outline" as const;
    case "PENDING":
      return "secondary" as const;
    case "CANCELLED":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUserById(id);
      if (response.success) {
        setUser(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: string) => {
    setUpdatingRole(true);
    try {
      const response = await adminApi.updateUserRole(id, newRole);
      if (response.success) {
        setUser((prev: any) => ({ ...prev, role: newRole }));
        toast.success(`Role updated to ${newRole}`);
      } else {
        toast.error(response.message || "Failed to update role");
      }
    } catch (err) {
      toast.error("Error updating role");
    } finally {
      setUpdatingRole(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error || "User not found"}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name || "Unnamed User"}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold">{user.name || "—"}</h2>
                <Badge variant={roleBadgeVariant(user.role)} className="mt-2">
                  {user.role}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Role Management */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">
                  Change Role
                </label>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  disabled={updatingRole}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">{user._count?.orders || 0}</div>
                <p className="text-xs text-muted-foreground">Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  ${Number(user.totalSpent || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </CardContent>
            </Card>
          </div>

          {/* Email Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Verified</span>
                {user.emailVerified ? (
                  <Badge variant="default">Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          {user.addresses && user.addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {user.addresses.map((addr: any) => (
                  <div key={addr.id} className="text-sm border rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{addr.firstName} {addr.lastName}</span>
                      {addr.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{addr.address1}</p>
                    {addr.address2 && <p className="text-muted-foreground">{addr.address2}</p>}
                    <p className="text-muted-foreground">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p className="text-muted-foreground">{addr.country}</p>
                    {addr.phone && <p className="text-muted-foreground">Phone: {addr.phone}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.recentOrders && user.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Order ID</th>
                        <th className="text-left p-3 font-medium">Items</th>
                        <th className="text-left p-3 font-medium">Total</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.recentOrders.map((order: any) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-mono text-sm">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="p-3 text-sm">
                            {order.items.map((item: any) => item.product?.name).join(", ") || "—"}
                          </td>
                          <td className="p-3 font-medium">
                            ${Number(order.total).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <Badge variant={statusBadgeVariant(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No orders yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
