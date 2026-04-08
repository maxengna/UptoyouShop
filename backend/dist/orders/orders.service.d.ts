import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$OrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    getOrders(userId: string, page?: number, limit?: number, status?: string): Promise<{
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
    getOrderById(userId: string, orderId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
    updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$OrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    trackOrder(orderNumber: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
}
