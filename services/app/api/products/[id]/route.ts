import { NextRequest } from "next/server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "../../../../services/products.service";
import {
  successResponse,
  errorResponse,
} from "../../../../lib/utils/api";

// GET /api/products/[id] - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getProductById(params.id);

    if (!result.success) {
      return errorResponse(result.error || "Failed to fetch product", result.status || 500);
    }

    return successResponse(result.data);
  } catch (error) {
    console.error("Error fetching product:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await updateProduct(params.id, request);

    if (!result.success) {
      return errorResponse(result.error || "Failed to update product", result.status || 400);
    }

    return successResponse(result.data, result.message || "Product updated successfully");
  } catch (error) {
    console.error("Error updating product:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteProduct(params.id);

    if (!result.success) {
      return errorResponse(result.error || "Failed to delete product", result.status || 400);
    }

    return successResponse(null, result.message || "Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    return errorResponse("Internal server error", 500);
  }
}
