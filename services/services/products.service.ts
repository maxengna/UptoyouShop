import { NextRequest } from "next/server";
import { prisma } from "../../database/prisma";
import { z } from "zod";

// Image schema for validation
const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().default(0),
  isMain: z.boolean().default(false),
});

// Product images schema
const productImagesSchema = z.array(imageSchema).optional();

// Query schema for validation
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z
    .enum([
      "price-asc",
      "price-desc",
      "name-asc",
      "name-desc",
      "newest",
      "rating",
    ])
    .default("newest"),
  inStock: z.coerce.boolean().optional(),
});

export async function getProducts(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const {
      page,
      limit,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy,
      inStock,
    } = query;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "rating":
        orderBy = { reviews: { _avg: { rating: "desc" } } };
        break;
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where });

    // Get products with relations
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 3,
        },
        variants: {
          where: { isActive: true },
        },
        reviews: {
          select: { rating: true },
        },
        inventory: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate average rating for each product
    const productsWithRatings = products.map((product) => ({
      ...product,
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0,
            ) / product.reviews.length
          : null,
      reviewCount: product.reviews.length,
    }));

    // Remove reviews from response as we only needed them for rating calculation
    const cleanProducts = productsWithRatings.map(
      ({ reviews, ...product }) => product,
    );

    return {
      success: true,
      data: {
        products: cleanProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Products service error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid query parameters",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to fetch products",
    };
  }
}

// Create product schema
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().min(0),
  originalPrice: z.number().min(0).optional(),
  sku: z.string().min(1).max(100),
  stock: z.number().min(0).default(0),
  categoryId: z.string(),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isOnSale: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  weight: z.number().min(0).optional(),
  dimensions: z
    .object({
      length: z.number().min(0),
      width: z.number().min(0),
      height: z.number().min(0),
    })
    .optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  images: productImagesSchema,
});

export async function createProduct(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, ...productData } = createProductSchema.parse(body);

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: productData.sku },
    });

    if (existingProduct) {
      return {
        success: false,
        error: "Product with this SKU already exists",
      };
    }

    // Check if slug already exists
    const existingSlug = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingSlug) {
      return {
        success: false,
        error: "Product with this slug already exists",
      };
    }

    // Create product
    const product = await prisma.product.create({
      data: productData,
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
      },
    });

    // Create images if provided
    if (images && images.length > 0) {
      const imageData = images.map((img, index) => ({
        productId: product.id,
        url: img.url,
        alt: img.alt || `${product.name} - Image ${index + 1}`,
        sortOrder: img.sortOrder || index,
        isMain: img.isMain || index === 0,
      }));

      await prisma.productImage.createMany({
        data: imageData,
      });
    }

    // Create inventory record
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: productData.stock,
        reorderLevel: 5,
      },
    });

    // Fetch product with images
    const productWithImages = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: true,
        inventory: true,
      },
    });

    return {
      success: true,
      data: productWithImages,
      message: "Product created successfully",
    };
  } catch (error) {
    console.error("Create product error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid product data",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to create product",
    };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        inventory: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
        status: 404,
      };
    }

    // Calculate average rating
    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce(
            (sum: number, review: any) => sum + review.rating,
            0,
          ) / product.reviews.length
        : null;

    return {
      success: true,
      data: {
        ...product,
        averageRating,
        reviewCount: product.reviews.length,
      },
    };
  } catch (error) {
    console.error("Get product error:", error);
    return {
      success: false,
      error: "Failed to fetch product",
    };
  }
}

export async function updateProduct(id: string, request: NextRequest) {
  try {
    const body = await request.json();
    const { images, ...productData } = createProductSchema
      .partial()
      .parse(body);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
        status: 404,
      };
    }

    // Check SKU uniqueness if changed
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const skuExists = await prisma.product.findUnique({
        where: { sku: productData.sku },
      });

      if (skuExists) {
        return {
          success: false,
          error: "Product with this SKU already exists",
        };
      }
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        images: true,
        variants: true,
        inventory: true,
      },
    });

    // Handle images if provided
    if (images !== undefined) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Create new images
      if (images.length > 0) {
        const imageData = images.map((img, index) => ({
          productId: id,
          url: img.url,
          alt: img.alt || `${product.name} - Image ${index + 1}`,
          sortOrder: img.sortOrder || index,
          isMain: img.isMain || index === 0,
        }));

        await prisma.productImage.createMany({
          data: imageData,
        });
      }
    }

    // Fetch updated product with images
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: true,
        inventory: true,
      },
    });

    return {
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    };
  } catch (error) {
    console.error("Update product error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Invalid product data",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Failed to update product",
    };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
        status: 404,
      };
    }

    // Check if product has orders
    if (existingProduct.orderItems.length > 0) {
      return {
        success: false,
        error: "Cannot delete product with existing orders",
        status: 400,
      };
    }

    // Delete product (cascade will handle related records)
    await prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: "Failed to delete product",
    };
  }
}
