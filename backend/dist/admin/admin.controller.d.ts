import { AdminService } from './admin.service';
import { UserRole } from '@prisma/client';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getSalesAnalytics(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            totalRevenue: number | import("@prisma/client/runtime/library").Decimal;
            totalOrders: number;
            averageOrderValue: number | import("@prisma/client/runtime/library").Decimal;
            salesByDay: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderGroupByOutputType, "createdAt"[]> & {
                _count: {
                    id: number;
                };
                _sum: {
                    total: import("@prisma/client/runtime/library").Decimal | null;
                };
            })[];
            topProducts: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.OrderItemGroupByOutputType, "productId"[]> & {
                _sum: {
                    quantity: number | null;
                    price: import("@prisma/client/runtime/library").Decimal | null;
                };
            })[];
        };
        message: string;
        errors: never[];
    }>;
    getProductAnalytics(): Promise<{
        success: boolean;
        data: {
            totalProducts: number;
            lowStockProducts: number;
            outOfStockProducts: number;
            topRatedProducts: {
                averageRating: number;
                reviews: undefined;
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
            recentProducts: {
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
        };
        message: string;
        errors: never[];
    }>;
    getCustomerAnalytics(): Promise<{
        success: boolean;
        data: {
            totalCustomers: number;
            newCustomers: number;
            activeCustomers: number;
            topCustomers: {
                totalSpent: number;
                orders: undefined;
                name: string | null;
                email: string;
                phone: string | null;
                id: string;
                passwordHash: string | null;
                role: import(".prisma/client").$Enums.UserRole;
                emailVerified: boolean;
                avatar: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        };
        message: string;
        errors: never[];
    }>;
    getAllOrders(page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: {
            orders: ({
                user: {
                    name: string | null;
                    email: string;
                    id: string;
                } | null;
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
    getAllUsers(page?: number, limit?: number, role?: string): Promise<{
        success: boolean;
        data: {
            users: {
                name: string | null;
                email: string;
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                emailVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                _count: {
                    orders: number;
                };
            }[];
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
    updateUserRole(userId: string, role: UserRole): Promise<{
        success: boolean;
        data: {
            name: string | null;
            email: string;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            updatedAt: Date;
        };
        message: string;
        errors: never[];
    }>;
}
