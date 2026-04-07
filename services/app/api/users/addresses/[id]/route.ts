import { NextRequest, NextResponse } from "next/server";
import { updateAddress, deleteAddress } from "@/services/users.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const result = await updateAddress(params.id, request);

  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const result = await deleteAddress(params.id);

  if (result.status) {
    return NextResponse.json(
      { success: result.success, error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}
