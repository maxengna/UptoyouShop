import { NextRequest, NextResponse } from "next/server";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  requestPasswordReset,
  changePassword,
} from "@/services/auth.service";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  // Handle different POST endpoints
  if (pathSegments.length === 3 && pathSegments[2] === "register") {
    // POST /api/auth/register
    const result = await registerUser(request);

    if (result.status) {
      return NextResponse.json(
        {
          success: result.success,
          error: result.error,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } else if (pathSegments.length === 3 && pathSegments[2] === "login") {
    // POST /api/auth/login
    const result = await loginUser(request);

    if (result.status) {
      return NextResponse.json(
        {
          success: result.success,
          error: result.error,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } else if (
    pathSegments.length === 3 &&
    pathSegments[2] === "reset-password"
  ) {
    // POST /api/auth/reset-password
    const result = await requestPasswordReset(request);

    if (result.status) {
      return NextResponse.json(
        {
          success: result.success,
          error: result.error,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } else if (
    pathSegments.length === 3 &&
    pathSegments[2] === "change-password"
  ) {
    // POST /api/auth/change-password
    const result = await changePassword(request);

    if (result.status) {
      return NextResponse.json(
        {
          success: result.success,
          error: result.error,
        },
        { status: result.status },
      );
    }

    return NextResponse.json(result);
  } else {
    return NextResponse.json(
      { success: false, error: "Invalid endpoint" },
      { status: 404 },
    );
  }
}

export async function GET() {
  const result = await getCurrentUser();

  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}
