import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";
export declare class CartService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCart(userId: string): Promise<{
        success: boolean;
        data: {
            items: {
                id: string;
                price: import("@prisma/client/runtime/library").Decimal;
                productId: string;
                quantity: number;
                variantId: string | null;
                addedAt: Date;
                cartId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date;
            userId: string | null;
            isActive: boolean;
            sessionId: string | null;
        };
        message: string;
        errors: never[];
    } | {
        success: boolean;
        data: {
            subtotal: number;
            itemCount: number;
            items: ({
                product: {
                    images: {
                        id: string;
                        createdAt: Date;
                        isMain: boolean;
                        productId: string;
                        url: string;
                        alt: string | null;
                        sortOrder: number;
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
                };
                variant: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    price: import("@prisma/client/runtime/library").Decimal | null;
                    sku: string | null;
                    stock: number | null;
                    isActive: boolean;
                    productId: string;
                    value: string;
                } | null;
            } & {
                id: string;
                price: import("@prisma/client/runtime/library").Decimal;
                productId: string;
                quantity: number;
                variantId: string | null;
                addedAt: Date;
                cartId: string;
            })[];
            id: string;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date;
            userId: string | null;
            isActive: boolean;
            sessionId: string | null;
        };
        message: string;
        errors: never[];
    }>;
    addItem(userId: string, addCartItemDto: AddCartItemDto): Promise<{
        success: boolean;
        data: {
            product: {
                images: {
                    id: string;
                    createdAt: Date;
                    isMain: boolean;
                    productId: string;
                    url: string;
                    alt: string | null;
                    sortOrder: number;
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
            };
            variant: {
                name: string;
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                stock: number | null;
                isActive: boolean;
                productId: string;
                value: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            variantId: string | null;
            addedAt: Date;
            cartId: string;
        };
        message: string;
        errors: never[];
    }>;
    updateItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    } | {
        success: boolean;
        data: {
            product: {
                images: {
                    id: string;
                    createdAt: Date;
                    isMain: boolean;
                    productId: string;
                    url: string;
                    alt: string | null;
                    sortOrder: number;
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
            };
            variant: {
                name: string;
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal | null;
                sku: string | null;
                stock: number | null;
                isActive: boolean;
                productId: string;
                value: string;
            } | null;
        } & {
            id: string;
            price: import("@prisma/client/runtime/library").Decimal;
            productId: string;
            quantity: number;
            variantId: string | null;
            addedAt: Date;
            cartId: string;
        };
        message: string;
        errors: never[];
    }>;
    removeItem(userId: string, cartItemId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    clearCart(userId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    applyCoupon(userId: string, code: string): Promise<{
        success: boolean;
        data: {
            name: string;
            type: import(".prisma/client").$Enums.CouponType;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date;
            isActive: boolean;
            value: import("@prisma/client/runtime/library").Decimal;
            code: string;
            minAmount: import("@prisma/client/runtime/library").Decimal | null;
            maxUses: number | null;
            usedCount: number;
            startsAt: Date;
        };
        message: string;
        errors: never[];
    }>;
}
