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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let OrdersService = class OrdersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createOrder(userId, createOrderDto) {
        const { items, shippingAddress, billingAddress, paymentMethod, notes } = createOrderDto;
        let subtotal = 0;
        const orderItems = [];
        for (const item of items) {
            const product = await this.prisma.product.findUnique({
                where: { id: item.productId },
                include: {
                    inventory: true,
                    variants: item.variantId ? { where: { id: item.variantId } } : false,
                    images: true,
                },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            const availableStock = item.variantId
                ? product.variants?.[0]?.stock || product.stock
                : product.stock;
            if (availableStock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const itemTotal = Number(product.price) * item.quantity;
            subtotal += itemTotal;
            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                variantId: item.variantId,
                price: product.price,
                productSnapshot: {
                    name: product.name,
                    slug: product.slug,
                    sku: product.sku,
                    images: product.images.map((img) => ({
                        url: img.url,
                        alt: img.alt,
                    })),
                },
            });
        }
        const tax = subtotal * 0.08;
        const shipping = subtotal > 50 ? 0 : 9.99;
        const total = subtotal + tax + shipping;
        const orderNumber = `ORD-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)
            .toUpperCase()}`;
        const order = await this.prisma.order.create({
            data: {
                userId,
                orderNumber,
                status: client_1.OrderStatus.PENDING,
                paymentStatus: client_1.PaymentStatus.PENDING,
                paymentMethod,
                subtotal,
                tax,
                shipping,
                total,
                currency: 'USD',
                shippingAddress,
                billingAddress: billingAddress || shippingAddress,
                notes,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                images: { where: { isMain: true }, take: 1 },
                            },
                        },
                        variant: true,
                    },
                },
            },
        });
        for (const item of items) {
            await this.prisma.inventory.update({
                where: { productId: item.productId },
                data: {
                    reserved: {
                        increment: item.quantity,
                    },
                },
            });
        }
        const cart = await this.prisma.cart.findFirst({
            where: { userId, isActive: true },
        });
        if (cart) {
            await this.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
        }
        return {
            success: true,
            data: order,
            message: 'Order created successfully',
            errors: [],
        };
    }
    async getOrders(userId, page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (status) {
            where.status = status.toUpperCase();
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: { where: { isMain: true }, take: 1 },
                                },
                            },
                        },
                    },
                    payments: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            success: true,
            data: {
                orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
            message: 'Orders retrieved successfully',
            errors: [],
        };
    }
    async getOrderById(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: { where: { isMain: true }, take: 1 },
                                category: true,
                            },
                        },
                        variant: true,
                    },
                },
                payments: true,
                reviews: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            success: true,
            data: order,
            message: 'Order retrieved successfully',
            errors: [],
        };
    }
    async updateOrderStatus(orderId, updateOrderStatusDto) {
        const { status } = updateOrderStatusDto;
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const updateData = { status };
        if (status === client_1.OrderStatus.SHIPPED) {
            updateData.shippedAt = new Date();
        }
        if (status === client_1.OrderStatus.DELIVERED) {
            updateData.deliveredAt = new Date();
        }
        const updatedOrder = await this.prisma.order.update({
            where: { id: orderId },
            data: updateData,
            include: {
                items: {
                    include: {
                        product: { select: { id: true, name: true } },
                    },
                },
            },
        });
        if (status === client_1.OrderStatus.SHIPPED || status === client_1.OrderStatus.DELIVERED) {
            for (const item of order.items) {
                await this.prisma.inventory.update({
                    where: { productId: item.productId },
                    data: {
                        quantity: { decrement: item.quantity },
                        reserved: { decrement: item.quantity },
                    },
                });
            }
        }
        if (status === client_1.OrderStatus.CANCELLED) {
            for (const item of order.items) {
                await this.prisma.inventory.update({
                    where: { productId: item.productId },
                    data: {
                        reserved: { decrement: item.quantity },
                    },
                });
            }
        }
        return {
            success: true,
            data: updatedOrder,
            message: 'Order status updated successfully',
            errors: [],
        };
    }
    async trackOrder(orderNumber) {
        const order = await this.prisma.order.findUnique({
            where: { orderNumber },
            select: {
                id: true,
                orderNumber: true,
                status: true,
                trackingNumber: true,
                shippedAt: true,
                deliveredAt: true,
                createdAt: true,
                shippingAddress: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return {
            success: true,
            data: order,
            message: 'Order tracking information retrieved',
            errors: [],
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map