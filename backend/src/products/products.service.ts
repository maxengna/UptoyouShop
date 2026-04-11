import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto, SortBy } from "./dto/product-query.dto";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = SortBy.NEWEST,
      inStock,
    } = query;

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

    let orderBy: any = { createdAt: "desc" };

    switch (sortBy) {
      case SortBy.PRICE_ASC:
        orderBy = { price: "asc" };
        break;
      case SortBy.PRICE_DESC:
        orderBy = { price: "desc" };
        break;
      case SortBy.NAME_ASC:
        orderBy = { name: "asc" };
        break;
      case SortBy.NAME_DESC:
        orderBy = { name: "desc" };
        break;
      case SortBy.NEWEST:
        orderBy = { createdAt: "desc" };
        break;
      case SortBy.RATING:
        orderBy = { reviews: { _avg: { rating: "desc" } } };
        break;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
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
      }),
      this.prisma.product.count({ where }),
    ]);

    // Calculate average rating for each product
    const productsWithRatings = products.map((product) => ({
      ...product,
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : null,
      reviewCount: product.reviews.length,
      reviews: undefined, // Remove raw reviews
    }));

    return {
      success: true,
      data: {
        products: productsWithRatings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      message: "Products retrieved successfully",
      errors: [],
    };
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
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
          take: 10,
        },
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    const averageRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : null;

    return {
      success: true,
      data: {
        ...product,
        averageRating,
        reviewCount: product.reviews.length,
      },
      message: "Product retrieved successfully",
      errors: [],
    };
  }

  async createProduct(createProductDto: CreateProductDto) {
    const { images, ...productData } = createProductDto;

    // Check if SKU already exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: productData.sku },
    });

    if (existingProduct) {
      throw new ConflictException("Product with this SKU already exists");
    }

    // Check if slug already exists
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (existingSlug) {
      throw new ConflictException("Product with this slug already exists");
    }

    // Create product
    const product = await this.prisma.product.create({
      data: {
        ...productData,
        dimensions: productData.dimensions
          ? { ...productData.dimensions }
          : undefined,
      },
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

      await this.prisma.productImage.createMany({
        data: imageData,
      });
    }

    // Create inventory record
    await this.prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: productData.stock || 0,
        reorderLevel: 5,
      },
    });

    // Fetch product with images
    const productWithImages = await this.prisma.product.findUnique({
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
      errors: [],
    };
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...productData } = updateProductDto;

    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException("Product not found");
    }

    // Check SKU uniqueness if changed
    if (productData.sku && productData.sku !== existingProduct.sku) {
      const skuExists = await this.prisma.product.findUnique({
        where: { sku: productData.sku },
      });

      if (skuExists) {
        throw new ConflictException("Product with this SKU already exists");
      }
    }

    // Update product
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        dimensions: productData.dimensions
          ? { ...productData.dimensions }
          : undefined,
      },
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
      await this.prisma.productImage.deleteMany({
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

        await this.prisma.productImage.createMany({
          data: imageData,
        });
      }
    }

    // Fetch updated product
    const updatedProduct = await this.prisma.product.findUnique({
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
      errors: [],
    };
  }

  async deleteProduct(id: string) {
    // Check if product exists
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException("Product not found");
    }

    // Check if product has orders
    if (existingProduct.orderItems.length > 0) {
      throw new BadRequestException(
        "Cannot delete product with existing orders",
      );
    }

    // Delete product (cascade will handle related records)
    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: "Product deleted successfully",
      errors: [],
    };
  }

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { productId, isActive: true },
      }),
    ]);

    return {
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "Reviews retrieved successfully",
      errors: [],
    };
  }
}
