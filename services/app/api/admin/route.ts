import { NextRequest, NextResponse } from "next/server";
import {
  getAdminOrders,
  getAdminOrderById,
  getAdminUsers,
  updateAdminOrderStatus,
  getSalesAnalytics,
  getProductAnalytics,
  getCustomerAnalytics,
  getSystemHealth,
} from "@/services/admin.service";

function getSegment(url: URL, index: number): string | undefined {
  return url.pathname.split("/").filter(Boolean)[index];
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const resource = getSegment(url, 2); // admin resource name: orders, users, analytics, health
  const subResource = getSegment(url, 3); // optional ID or sub-type

  // GET /api/admin/orders/{orderId}
  if (resource === "orders" && subResource) {
    const result = await getAdminOrderById(subResource);

    if (!result.success) {
      return NextResponse.json(result, { status: (result as any).status || 404 });
    }

    return NextResponse.json(result);
  }

  // GET /api/admin/orders
  if (resource === "orders" && !subResource) {
    const result = await getAdminOrders(request);

    if (!result.success) {
      return NextResponse.json({ error: result });
    }

    return NextResponse.json(result);
  }

  // GET /api/admin/users
  if (resource === "users") {
    const result = await getAdminUsers(request);

    if (!result.success) {
      return NextResponse.json({ error: result });
    }

    return NextResponse.json(result);
  }

  // GET /api/admin/analytics?type=sales|products|customers
  if (resource === "analytics") {
    const type = url.searchParams.get("type");

    if (type === "sales") {
      const result = await getSalesAnalytics(request);

      if (!result.success) {
        return NextResponse.json({ error: result });
      }

      return NextResponse.json(result);
    } else if (type === "products") {
      const result = await getProductAnalytics(request);

      if (!result.success) {
        return NextResponse.json({ error: result });
      }

      return NextResponse.json(result);
    } else if (type === "customers") {
      const result = await getCustomerAnalytics(request);

      if (!result.success) {
        return NextResponse.json({ error: result });
      }

      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid analytics type. Use: sales, products, or customers",
        },
        { status: 400 },
      );
    }
  }

  // GET /api/admin/health
  if (resource === "health") {
    const result = await getSystemHealth();

    if (!result.success) {
      return NextResponse.json({ error: result });
    }

    return NextResponse.json(result);
  }

  return NextResponse.json(
    { success: false, error: "Invalid endpoint" },
    { status: 404 },
  );
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const resource = getSegment(url, 2);
  const orderId = getSegment(url, 3);

  // PUT /api/admin/orders/{orderId}
  if (resource === "orders" && orderId) {
    const result = await updateAdminOrderStatus(orderId, request);

    if (!result.success) {
      return NextResponse.json(result, { status: (result as any).status || 400 });
    }

    return NextResponse.json(result);
  }

  return NextResponse.json(
    { success: false, error: "Invalid endpoint" },
    { status: 404 },
  );
}
