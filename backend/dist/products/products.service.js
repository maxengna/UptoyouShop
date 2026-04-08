"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const product_query_dto_1 = require("./dto/product-query.dto");
let ProductsService = class ProductsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts(query) {
        const { page = 1, limit = 12, category, search, minPrice, maxPrice, sortBy = product_query_dto_1.SortBy.NEWEST, inStock, } = query;
        const where = {
            isActive: true,
        };
        if (category) {
            where.category = {
                slug: category,
            };
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined)
                where.price.gte = minPrice;
            if (maxPrice !== undefined)
                where.price.lte = maxPrice;
        }
        if (inStock) {
            where.stock = { gt: 0 };
        }
        let orderBy = { createdAt: 'desc' };
        switch (sortBy) {
            case product_query_dto_1.SortBy.PRICE_ASC:
                orderBy = { price: 'asc' };
                break;
            case product_query_dto_1.SortBy.PRICE_DESC:
                orderBy = { price: 'desc' };
                break;
            case product_query_dto_1.SortBy.NAME_ASC:
                orderBy = { name: 'asc' };
                break;
            case product_query_dto_1.SortBy.NAME_DESC:
                orderBy = { name: 'desc' };
                break;
            case product_query_dto_1.SortBy.NEWEST:
                orderBy = { createdAt: 'desc' };
                break;
            case product_query_dto_1.SortBy.RATING:
                orderBy = { reviews: { _avg: { rating: 'desc' } } };
                break;
        }
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    images: {
                        orderBy: { sortOrder: 'asc' },
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
        const productsWithRatings = products.map((product) => ({
            ...product,
            averageRating: product.reviews.length > 0
                ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
                    product.reviews.length
                : null,
            reviewCount: product.reviews.length,
            reviews: undefined,
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
            message: 'Products retrieved successfully',
            errors: [],
        };
    }
    async getProductById(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
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
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                inventory: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const averageRating = product.reviews.length > 0
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
            message: 'Product retrieved successfully',
            errors: [],
        };
    }
    async createProduct(createProductDto) {
        const { images, ...productData } = createProductDto;
        const existingProduct = await this.prisma.product.findUnique({
            where: { sku: productData.sku },
        });
        if (existingProduct) {
            throw new common_1.ConflictException('Product with this SKU already exists');
        }
        const existingSlug = await this.prisma.product.findUnique({
            where: { slug: productData.slug },
        });
        if (existingSlug) {
            throw new common_1.ConflictException('Product with this slug already exists');
        }
        const product = await this.prisma.product.create({
            data: productData,
            include: {
                category: true,
                images: true,
                variants: true,
                inventory: true,
            },
        });
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
        await this.prisma.inventory.create({
            data: {
                productId: product.id,
                quantity: productData.stock || 0,
                reorderLevel: 5,
            },
        });
        const productWithImages = await this.prisma.product.findUnique({
            where: { id: product.id },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                variants: true,
                inventory: true,
            },
        });
        return {
            success: true,
            data: productWithImages,
            message: 'Product created successfully',
            errors: [],
        };
    }
    async updateProduct(id, updateProductDto) {
        const { images, ...productData } = updateProductDto;
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (productData.sku && productData.sku !== existingProduct.sku) {
            const skuExists = await this.prisma.product.findUnique({
                where: { sku: productData.sku },
            });
            if (skuExists) {
                throw new common_1.ConflictException('Product with this SKU already exists');
            }
        }
        const product = await this.prisma.product.update({
            where: { id },
            data: productData,
            include: {
                category: true,
                images: true,
                variants: true,
                inventory: true,
            },
        });
        if (images !== undefined) {
            await this.prisma.productImage.deleteMany({
                where: { productId: id },
            });
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
        const updatedProduct = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                images: {
                    orderBy: { sortOrder: 'asc' },
                },
                variants: true,
                inventory: true,
            },
        });
        return {
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully',
            errors: [],
        };
    }
    async deleteProduct(id) {
        const existingProduct = await this.prisma.product.findUnique({
            where: { id },
            include: {
                orderItems: true,
            },
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (existingProduct.orderItems.length > 0) {
            throw new common_1.BadRequestException('Cannot delete product with existing orders');
        }
        await this.prisma.product.delete({
            where: { id },
        });
        return {
            success: true,
            data: null,
            message: 'Product deleted successfully',
            errors: [],
        };
    }
    async getProductReviews(productId, page = 1, limit = 10) {
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
                orderBy: { createdAt: 'desc' },
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
            message: 'Reviews retrieved successfully',
            errors: [],
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map