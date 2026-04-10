import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            shipping: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            billingAddress: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            trackingNumber: string | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        };
        message: string;
        errors: never[];
    }>;
    getOrders(userId: string, page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: {
            orders: ({
                items: ({
                    product: {
                        name: string;
                        id: string;
                        images: {
                            id: string;
                            createdAt: Date;
                            isMain: boolean;
                            productId: string;
                            url: string;
                            alt: string | null;
                            sortOrder: number;
                        }[];
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    price: import("@prisma/client/runtime/library").Decimal;
                    orderId: string;
                    productId: string;
                    quantity: number;
                    variantId: string | null;
                    productSnapshot: import("@prisma/client/runtime/library").JsonValue;
                })[];
                payments: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.PaymentStatus;
                    currency: string;
                    orderId: string;
                    paymentIntent: string;
                    amount: import("@prisma/client/runtime/library").Decimal;
                    method: string | null;
                    provider: string;
                    metadata: import("@prisma/client/runtime/library").JsonValue | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                orderNumber: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentMethod: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                tax: import("@prisma/client/runtime/library").Decimal;
                shipping: import("@prisma/client/runtime/library").Decimal;
                total: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                shippingAddress: import("@prisma/client/runtime/library").JsonValue;
                billingAddress: import("@prisma/client/runtime/library").JsonValue | null;
                notes: string | null;
                trackingNumber: string | null;
                shippedAt: Date | null;
                deliveredAt: Date | null;
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
    getOrderById(userId: string, orderId: string): Promise<{
        success: boolean;
        data: {
            items: ({
                product: {
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
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                productId: string;
                quantity: number;
                variantId: string | null;
                productSnapshot: import("@prisma/client/runtime/library").JsonValue;
            })[];
            reviews: {
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
            }[];
            payments: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.PaymentStatus;
                currency: string;
                orderId: string;
                paymentIntent: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                method: string | null;
                provider: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            shipping: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            billingAddress: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            trackingNumber: string | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        };
        message: string;
        errors: never[];
    }>;
    updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        success: boolean;
        data: {
            items: ({
                product: {
                    name: string;
                    id: string;
                };
            } & {
                id: string;
                createdAt: Date;
                price: import("@prisma/client/runtime/library").Decimal;
                orderId: string;
                productId: string;
                quantity: number;
                variantId: string | null;
                productSnapshot: import("@prisma/client/runtime/library").JsonValue;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            tax: import("@prisma/client/runtime/library").Decimal;
            shipping: import("@prisma/client/runtime/library").Decimal;
            total: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            billingAddress: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            trackingNumber: string | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        };
        message: string;
        errors: never[];
    }>;
    trackOrder(orderNumber: string): Promise<{
        success: boolean;
        data: {
            id: string;
            createdAt: Date;
            orderNumber: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            shippingAddress: import("@prisma/client/runtime/library").JsonValue;
            trackingNumber: string | null;
            shippedAt: Date | null;
            deliveredAt: Date | null;
        };
        message: string;
        errors: never[];
    }>;
}
