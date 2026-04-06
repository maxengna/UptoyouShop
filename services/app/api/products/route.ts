import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../database/prisma";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../../lib/utils/api";
import {
  getProducts as getProductsService,
  createProduct as createProductService,
} from "@/services/products.service";

// Validation schema
const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, "Price is required")
    .transform((val) => parseFloat(val)),
  comparePrice: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  trackInventory: z.boolean().default(true),
  stock: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  weight: z
    .string()
    .optional()
    .transform((val) => (val ? parseFloat(val) : undefined)),
  dimensions: z
    .object({
      length: z.string().optional(),
      width: z.string().optional(),
      height: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).default([]),
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.string().optional(),
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
        sortOrder: z.number().optional(),
        isMain: z.boolean().optional(),
      }),
    )
    .default([]),
});

// Generate slug from text
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("POST /api/products - body:", body);
    console.log("POST /api/products - body type:", typeof body);

    // Validate request body
    const validatedData = createProductSchema.parse(body);

    // Generate slug from name
    let slug = generateSlug(validatedData.name);

    // Check if slug already exists and make unique
    const existingSlug = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Find or create category
    let category = await prisma.category.findUnique({
      where: { name: validatedData.category },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: validatedData.category,
          slug: generateSlug(validatedData.category),
        },
      });
    }

    // Prepare data for service (transform to service schema)
    const productData = {
      name: validatedData.name,
      slug,
      description: validatedData.description,
      price: validatedData.price,
      originalPrice: validatedData.comparePrice,
      sku: validatedData.sku,
      stock: validatedData.stock || 0,
      categoryId: category.id,
      isActive: validatedData.status === "active",
      isNew: false,
      isOnSale: false,
      tags: validatedData.tags,
      weight: validatedData.weight,
      dimensions: validatedData.dimensions
        ? {
            length: validatedData.dimensions.length
              ? parseFloat(validatedData.dimensions.length)
              : undefined,
            width: validatedData.dimensions.width
              ? parseFloat(validatedData.dimensions.width)
              : undefined,
            height: validatedData.dimensions.height
              ? parseFloat(validatedData.dimensions.height)
              : undefined,
          }
        : undefined,
      seoTitle: validatedData.seo?.title,
      seoDescription: validatedData.seo?.description,
      images: validatedData.images, // Add images to productData
    };

    // Call service to create product
    const result = await createProductService(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify(productData),
      }) as NextRequest,
    );

    if (!result.success) {
      return errorResponse(result.error || "Failed to create product", 400);
    }

    return successResponse(
      { product: result.data },
      result.message || "Product created successfully",
    );
  } catch (error) {
    console.error("Error creating product:", error);

    if (error instanceof z.ZodError) {
      return validationErrorResponse(error.errors);
    }

    return errorResponse("Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await getProductsService(request);

    if (!result.success) {
      return errorResponse(result.error || "Failed to fetch products", 500);
    }

    return successResponse(result.data);
  } catch (error) {
    console.error("Error fetching products:", error);

    return errorResponse("Internal server error", 500);
  }
}
