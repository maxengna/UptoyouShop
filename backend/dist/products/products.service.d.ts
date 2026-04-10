import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProducts(query: ProductQueryDto): Promise<{
        success: boolean;
        data: {
            products: {
                averageRating: number | null;
                reviewCount: number;
                reviews: undefined;
                category: {
                    name: string;
                    description: string | null;
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    slug: string;
                    isActive: boolean;
                    sortOrder: number;
                    image: string | null;
                    parentId: string | null;
                };
                inventory: {
                    id: string;
                    productId: string;
                    quantity: number;
                    reserved: number;
                    reorderLevel: number;
                    lastUpdated: Date;
                } | null;
                images: {
                    id: string;
                    createdAt: Date;
                    isMain: boolean;
                    productId: string;
                    url: string;
                    alt: string | null;
                    sortOrder: number;
                }[];
                variants: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    price: import("@prisma/client/runtime/library").Decimal | null;
                    sku: string | null;
                    stock: number | null;
                    isActive: boolean;
                    productId: string;
                    value: string;
                }[];
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tags: string[];
                slug: string;
                price: import("@prisma/client/runtime/library").Decimal;
                originalPrice: import("@prisma/client/runtime/library").Decimal | null;
                sku: string;
                stock: number;
                categoryId: string;
                isActive: boolean;
                isNew: boolean;
                isOnSale: boolean;
                weight: import("@prisma/client/runtime/library").Decimal | null;
                dimensions: import("@prisma/client/runtime/library").JsonValue | null;
                seoTitle: string | null;
                seoDescription: string | null;
            }[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
                hasNext: boolean;
                hasPrev: boolean;
            };
        };
        message: string;
        errors: never[];
    }>;
    getProductById(id: string): Promise<{
        success: boolean;
        data: {
            averageRating: number | null;
            reviewCount: number;
            category: {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                isActive: boolean;
                sortOrder: number;
                image: string | null;
                parentId: string | null;
            };
            inventory: {
                id: string;
                productId: string;
                quantity: number;
                reserved: number;
                reorderLevel: number;
                lastUpdated: Date;
            } | null;
            reviews: ({
                user: {
                    name: string | null;
                    id: string;
                } | null;
            } & {
                title: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                content: string;
                isActive: boolean;
                orderId: string | null;
                productId: string;
                rating: number;
                isVerified: boolean;
            })[];
            images: {
                id: string;
                createdAt: Date;
                isMain: boolean;
                productId: string;
                url: string;
                alt: string | null;
                sortOrder: number;
            }[];
            variants: {
                name: string;
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                stock: number | null;
                isActive: boolean;
                productId: string;
                value: string;
            }[];
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            categoryId: string;
            isActive: boolean;
            isNew: boolean;
            isOnSale: boolean;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            dimensions: import("@prisma/client/runtime/library").JsonValue | null;
            seoTitle: string | null;
            seoDescription: string | null;
        };
        message: string;
        errors: never[];
    }>;
    createProduct(createProductDto: CreateProductDto): Promise<{
        success: boolean;
        data: ({
            category: {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                isActive: boolean;
                sortOrder: number;
                image: string | null;
                parentId: string | null;
            };
            inventory: {
                id: string;
                productId: string;
                quantity: number;
                reserved: number;
                reorderLevel: number;
                lastUpdated: Date;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                isMain: boolean;
                productId: string;
                url: string;
                alt: string | null;
                sortOrder: number;
            }[];
            variants: {
                name: string;
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                stock: number | null;
                isActive: boolean;
                productId: string;
                value: string;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            categoryId: string;
            isActive: boolean;
            isNew: boolean;
            isOnSale: boolean;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            dimensions: import("@prisma/client/runtime/library").JsonValue | null;
            seoTitle: string | null;
            seoDescription: string | null;
        }) | null;
        message: string;
        errors: never[];
    }>;
    updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<{
        success: boolean;
        data: ({
            category: {
                name: string;
                description: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                isActive: boolean;
                sortOrder: number;
                image: string | null;
                parentId: string | null;
            };
            inventory: {
                id: string;
                productId: string;
                quantity: number;
                reserved: number;
                reorderLevel: number;
                lastUpdated: Date;
            } | null;
            images: {
                id: string;
                createdAt: Date;
                isMain: boolean;
                productId: string;
                url: string;
                alt: string | null;
                sortOrder: number;
            }[];
            variants: {
                name: string;
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                stock: number | null;
                isActive: boolean;
                productId: string;
                value: string;
            }[];
        } & {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            slug: string;
            price: import("@prisma/client/runtime/library").Decimal;
            originalPrice: import("@prisma/client/runtime/library").Decimal | null;
            sku: string;
            stock: number;
            categoryId: string;
            isActive: boolean;
            isNew: boolean;
            isOnSale: boolean;
            weight: import("@prisma/client/runtime/library").Decimal | null;
            dimensions: import("@prisma/client/runtime/library").JsonValue | null;
            seoTitle: string | null;
            seoDescription: string | null;
        }) | null;
        message: string;
        errors: never[];
    }>;
    deleteProduct(id: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            reviews: ({
                user: {
                    name: string | null;
                    id: string;
                } | null;
            } & {
                title: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                content: string;
                isActive: boolean;
                orderId: string | null;
                productId: string;
                rating: number;
                isVerified: boolean;
            })[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
        message: string;
        errors: never[];
    }>;
}
