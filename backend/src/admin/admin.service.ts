import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSalesAnalytics(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [
      totalRevenue,
      totalOrders,
      averageOrderValue,
      salesByDay,
      topProducts,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
        _avg: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: start, lte: end },
            status: { not: 'CANCELLED' },
          },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        averageOrderValue: averageOrderValue._avg.total || 0,
        salesByDay,
        topProducts,
      },
      message: 'Sales analytics retrieved successfully',
      errors: [],
    };
  }

  async getProductAnalytics() {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      topRatedProducts,
      recentProducts,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({
        where: { stock: { lte: 5, gt: 0 } },
      }),
      this.prisma.product.count({
        where: { stock: 0 },
      }),
      this.prisma.product.findMany({
        include: {
          reviews: { select: { rating: true } },
        },
        take: 10,
      }),
      this.prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate ratings
    const productsWithRatings = topRatedProducts.map((product) => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0,
      reviews: undefined,
    }));

    return {
      success: true,
      data: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        topRatedProducts: productsWithRatings.sort((a, b) => b.averageRating - a.averageRating),
        recentProducts,
      },
      message: 'Product analytics retrieved successfully',
      errors: [],
    };
  }

  async getCustomerAnalytics() {
    const [
      totalCustomers,
      newCustomers,
      activeCustomers,
      topCustomers,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      this.prisma.order.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { userId: true },
      }),
      this.prisma.user.findMany({
        where: { role: UserRole.CUSTOMER },
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { total: true },
          },
        },
        take: 10,
      }),
    ]);

    const customersWithTotals = topCustomers.map((customer) => ({
      ...customer,
      totalSpent: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
      orders: undefined,
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        activeCustomers: activeCustomers.length,
        topCustomers: customersWithTotals,
      },
      message: 'Customer analytics retrieved successfully',
      errors: [],
    };
  }

  async getAllOrders(page = 1, limit = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status.toUpperCase();

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
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

  async getAllUsers(page = 1, limit = 10, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role.toUpperCase();

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Users retrieved successfully',
      errors: [],
    };
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: updatedUser,
      message: 'User role updated successfully',
      errors: [],
    };
  }
}
