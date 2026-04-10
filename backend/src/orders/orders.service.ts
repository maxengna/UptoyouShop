import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderStatus, PaymentStatus } from "@prisma/client";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { items, shippingAddress, billingAddress, paymentMethod, notes } =
      createOrderDto;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];

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
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      // Check stock
      const availableStock = item.variantId
        ? product.variants?.[0]?.stock || product.stock
        : product.stock;

      if (availableStock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
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

    // Calculate totals
    const tax = subtotal * 0.08; // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // Create order
    const order = await this.prisma.order.create({
      data: {
        userId,
        orderNumber,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        currency: "USD",
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

    // Reserve inventory
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

    // Clear user's cart
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
      message: "Order created successfully",
      errors: [],
    };
  }

  async getOrders(userId: string, page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
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
        orderBy: { createdAt: "desc" },
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
      message: "Orders retrieved successfully",
      errors: [],
    };
  }

  async getOrderById(userId: string, orderId: string) {
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
      throw new NotFoundException("Order not found");
    }

    return {
      success: true,
      data: order,
      message: "Order retrieved successfully",
      errors: [],
    };
  }

  async updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const { status } = updateOrderStatusDto;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    const updateData: any = { status };

    if (status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }
    if (status === OrderStatus.DELIVERED) {
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

    // Update inventory when order is shipped/delivered
    if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
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

    // Release inventory if order is cancelled
    if (status === OrderStatus.CANCELLED) {
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
      message: "Order status updated successfully",
      errors: [],
    };
  }

  async trackOrder(orderNumber: string) {
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
      throw new NotFoundException("Order not found");
    }

    return {
      success: true,
      data: order,
      message: "Order tracking information retrieved",
      errors: [],
    };
  }
}
