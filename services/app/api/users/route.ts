import { NextRequest, NextResponse } from "next/server";
import {
  getUserProfile,
  updateProfile,
  getUserAddresses,
  getUserOrderHistory,
} from "@/services/users.service";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  // Handle different GET endpoints
  if (pathSegments.length === 4 && pathSegments[3] === "addresses") {
    // GET /api/users/addresses
    const result = await getUserAddresses();

    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } else if (pathSegments.length === 4 && pathSegments[3] === "orders") {
    // GET /api/users/orders
    const result = await getUserOrderHistory(request);

    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } else {
    // GET /api/users (profile)
    const result = await getUserProfile();

    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  }
}

export async function PUT(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 4 && pathSegments[3] === "addresses") {
    // PUT /api/users/addresses/[id] - handled by separate route
    return NextResponse.json(
      {
        success: false,
        error: "Use /api/users/addresses/[id] for updating addresses",
      },
      { status: 400 },
    );
  } else {
    // PUT /api/users (update profile)
    const result = await updateProfile(request);

    if (result.status) {
      return NextResponse.json(
        { success: result.success, error: result.error },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  }
}
