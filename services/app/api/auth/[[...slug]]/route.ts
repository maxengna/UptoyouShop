import { NextRequest, NextResponse } from "next/server";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  requestPasswordReset,
  verifyResetToken,
  confirmPasswordReset,
  changePassword,
} from "@/services/auth.service";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 3 && pathSegments[2] === "register") {
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
    pathSegments.length === 4 &&
    pathSegments[2] === "reset-password" &&
    pathSegments[3] === "confirm"
  ) {
    const result = await confirmPasswordReset(request);

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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  if (
    pathSegments.length === 4 &&
    pathSegments[2] === "reset-password" &&
    pathSegments[3] === "verify"
  ) {
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 },
      );
    }

    const result = await verifyResetToken(token);

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
  }

  const result = await getCurrentUser();

  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}
