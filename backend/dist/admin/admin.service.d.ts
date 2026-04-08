import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class AdminService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSalesAnalytics(startDate?: string, endDate?: string): Promise<{
        success: boolean;
        data: {
            totalRevenue: any;
            totalOrders: any;
            averageOrderValue: any;
            salesByDay: any;
            topProducts: any;
        };
        message: string;
        errors: never[];
    }>;
    getProductAnalytics(): Promise<{
        success: boolean;
        data: {
            totalProducts: any;
            lowStockProducts: any;
            outOfStockProducts: any;
            topRatedProducts: any;
            recentProducts: any;
        };
        message: string;
        errors: never[];
    }>;
    getCustomerAnalytics(): Promise<{
        success: boolean;
        data: {
            totalCustomers: any;
            newCustomers: any;
            activeCustomers: any;
            topCustomers: any;
        };
        message: string;
        errors: never[];
    }>;
    getAllOrders(page?: number, limit?: number, status?: string): Promise<{
        success: boolean;
        data: {
            orders: any;
            pagination: {
                page: number;
                limit: number;
                total: any;
                pages: number;
            };
        };
        message: string;
        errors: never[];
    }>;
    getAllUsers(page?: number, limit?: number, role?: string): Promise<{
        success: boolean;
        data: {
            users: any;
            pagination: {
                page: number;
                limit: number;
                total: any;
                pages: number;
            };
        };
        message: string;
        errors: never[];
    }>;
    updateUserRole(userId: string, role: UserRole): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
}
