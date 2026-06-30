import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../upload/s3.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import * as crypto from "crypto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const MAX_RETRIES = 3;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const { items, shippingAddress, billingAddress, paymentMethod, notes } =
              createOrderDto;

            let subtotal = 0;
            const orderItems: any[] = [];

            for (const item of items) {
              const product = await tx.product.findUnique({
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

              const availableStock = item.variantId
                ? product.variants?.[0]?.stock || product.stock
                : (product.inventory?.quantity ?? product.stock) - (product.inventory?.reserved ?? 0);

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
                    imageKey: img.imageKey,
                    url: this.s3Service.getPublicUrl(img.imageKey),
                    alt: img.alt,
                  })),
                },
              });
            }

            const tax = subtotal * 0.08;
            const shipping = subtotal > 50 ? 0 : 9.99;
            const total = subtotal + tax + shipping;

            const randomPart = crypto.randomBytes(6).toString("hex").toUpperCase();
            const orderNumber = `ORD-${Date.now()}-${randomPart}`;

            const order = await tx.order.create({
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
                shippingAddress: { ...shippingAddress },
                billingAddress: billingAddress ? { ...billingAddress } : undefined,
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

            const cart = await tx.cart.findFirst({
              where: { userId, isActive: true },
            });

            if (cart) {
              await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
              });
            }

            return {
              success: true,
              data: order,
              message: "Order created successfully",
              errors: [],
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000,
          },
        );
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2034" &&
          attempt < MAX_RETRIES - 1
        ) {
          continue;
        }
        throw err;
      }
    }
  }

  async confirmOrderPayment(orderId: string, paymentId?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (paymentId) {
        await tx.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.COMPLETED },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: OrderStatus.PROCESSING,
        },
      });

      for (const item of order.items) {
        await tx.inventory.upsert({
          where: { productId: item.productId },
          update: {
            reserved: { increment: item.quantity },
          },
          create: {
            productId: item.productId,
            quantity: 0,
            reserved: item.quantity,
          },
        });

        // Decrement Product.stock so the frontend shows accurate available stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        // If item has a variant, decrement variant stock too
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }
    });
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

        // Restore product stock that was decremented at payment confirmation
        await this.prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });

        if (item.variantId) {
          await this.prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
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
        orderNumber: true,
        status: true,
        trackingNumber: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
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
