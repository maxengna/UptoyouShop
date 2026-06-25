import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../upload/s3.service';
import { UserRole, OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

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

  async getDashboardStats(period?: string) {
    const now = new Date();
    let currentStart: Date;

    switch (period) {
      case '7d':
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        currentStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const periodDuration = now.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - periodDuration);

    // Current period data
    const [
      currentRevenueAgg,
      currentOrdersCount,
      currentCustomersCount,
      currentProductsCount,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: OrderStatus.CANCELLED },
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: { gte: currentStart, lte: now },
        },
      }),
      this.prisma.product.count({
        where: { createdAt: { gte: currentStart, lte: now } },
      }),
    ]);

    // Previous period data for comparison
    const [
      previousRevenueAgg,
      previousOrdersCount,
      previousCustomersCount,
      previousProductsCount,
    ] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStart, lte: currentStart },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
      }),
      this.prisma.order.count({
        where: {
          createdAt: { gte: previousStart, lte: currentStart },
          status: { not: OrderStatus.CANCELLED },
        },
      }),
      this.prisma.user.count({
        where: {
          role: UserRole.CUSTOMER,
          createdAt: { gte: previousStart, lte: currentStart },
        },
      }),
      this.prisma.product.count({
        where: { createdAt: { gte: previousStart, lte: currentStart } },
      }),
    ]);

    // Totals and lists
    const [
      totalCustomers,
      totalProducts,
      recentOrders,
      topProductGroups,
      salesByDay,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.product.count(),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { take: 5, select: { quantity: true } },
        },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: currentStart, lte: now },
            status: { not: OrderStatus.CANCELLED },
          },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
      this.prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Get product details for top products
    const topProductIds = topProductGroups.map(p => p.productId);
    const products = topProductIds.length > 0 ? await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { imageKey: true } },
      },
    }) : [];

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      success: true,
      data: {
        totalRevenue: Number(currentRevenueAgg._sum.total || 0),
        totalOrders: currentOrdersCount,
        totalCustomers,
        totalProducts,
        revenueChange: calcChange(
          Number(currentRevenueAgg._sum.total || 0),
          Number(previousRevenueAgg._sum.total || 0),
        ),
        ordersChange: calcChange(currentOrdersCount, previousOrdersCount),
        customersChange: calcChange(currentCustomersCount, previousCustomersCount),
        productsChange: calcChange(currentProductsCount, previousProductsCount),
        recentOrders: recentOrders.map(order => ({
          id: order.orderNumber,
          customer: order.user?.name || order.user?.email || 'Unknown',
          amount: Number(order.total),
          status: order.status.toLowerCase(),
          date: order.createdAt,
          items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        })),
        topProducts: await Promise.all(topProductGroups.map(async g => {
          const product = products.find(p => p.id === g.productId);
          const imageKey = product?.images?.[0]?.imageKey;
          return {
            id: g.productId,
            name: product?.name || 'Unknown',
            sales: g._sum.quantity || 0,
            revenue: Number(g._sum.price || 0),
            stock: product?.stock || 0,
            image: imageKey ? await this.s3Service.getSignedUrl(imageKey) : null,
          };
        })),
        salesData: salesByDay.map(s => ({
          date: s.createdAt,
          revenue: Number(s._sum.total || 0),
          orders: s._count.id,
        })),
      },
      message: 'Dashboard analytics retrieved successfully',
      errors: [],
    };
  }

  async getAnalyticsOverview(period?: string) {
    const now = new Date();
    let currentStart: Date;

    switch (period) {
      case '7d':
        currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        currentStart = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const periodDuration = now.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - periodDuration);

    const [
      currentRevenueAgg,
      currentOrdersAgg,
      currentOrdersCount,
      currentCustomersCount,
      currentProductsCount,
      previousRevenueAgg,
      previousOrdersCount,
      previousCustomersCount,
      previousProductsCount,
      totalCustomers,
      totalProducts,
      recentOrders,
      topProductGroups,
      salesByDay,
      lowStockCount,
      outOfStockCount,
      topRated,
      newCustomers,
      activeCustomers,
      topCustomerData,
    ] = await Promise.all([
      // Current period revenue
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      // Current period AOV
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: 'CANCELLED' },
        },
        _avg: { total: true },
      }),
      // Current period orders count
      this.prisma.order.count({
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: 'CANCELLED' },
        },
      }),
      // Current period new customers
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: currentStart, lte: now },
        },
      }),
      // Current period new products
      this.prisma.product.count({
        where: { createdAt: { gte: currentStart, lte: now } },
      }),
      // Previous period revenue
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStart, lte: currentStart },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      // Previous period orders
      this.prisma.order.count({
        where: {
          createdAt: { gte: previousStart, lte: currentStart },
          status: { not: 'CANCELLED' },
        },
      }),
      // Previous period customers
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: previousStart, lte: currentStart },
        },
      }),
      // Previous period products
      this.prisma.product.count({
        where: { createdAt: { gte: previousStart, lte: currentStart } },
      }),
      // Total customers
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      // Total products
      this.prisma.product.count(),
      // Recent orders
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { take: 5, select: { quantity: true } },
        },
      }),
      // Top products by revenue
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: { gte: currentStart, lte: now },
            status: { not: 'CANCELLED' },
          },
        },
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { price: 'desc' } },
        take: 5,
      }),
      // Sales by day
      this.prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: currentStart, lte: now },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Low stock products
      this.prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
      // Out of stock products
      this.prisma.product.count({ where: { stock: 0 } }),
      // Top rated products
      this.prisma.product.findMany({
        include: { reviews: { select: { rating: true } } },
        take: 10,
      }),
      // New customers (last 30d)
      this.prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      // Active customers (last 30d)
      this.prisma.order.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
        },
        _count: { userId: true },
      }),
      // Top customers by spending
      this.prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        include: {
          orders: {
            where: { status: { not: 'CANCELLED' } },
            select: { total: true },
          },
        },
        take: 10,
      }),
    ]);

    // Map top products with images
    const topProductIds = topProductGroups.map(p => p.productId);
    const products = topProductIds.length > 0 ? await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: {
        id: true,
        name: true,
        stock: true,
        images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { imageKey: true } },
      },
    }) : [];

    // Map top rated products
    const productsWithRatings = topRated.map((product) => ({
      id: product.id,
      name: product.name,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0,
      reviewsCount: product.reviews.length,
    })).sort((a, b) => b.averageRating - a.averageRating);

    // Map top customers
    const customersWithTotals = topCustomerData.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      totalSpent: customer.orders.reduce((sum, o) => sum + Number(o.total), 0),
    })).sort((a, b) => b.totalSpent - a.totalSpent);

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      success: true,
      data: {
        // KPI summary
        totalRevenue: Number(currentRevenueAgg._sum.total || 0),
        totalOrders: currentOrdersCount,
        averageOrderValue: Number(currentOrdersAgg._avg.total || 0),
        totalProducts,
        totalCustomers,
        // Changes
        revenueChange: calcChange(
          Number(currentRevenueAgg._sum.total || 0),
          Number(previousRevenueAgg._sum.total || 0),
        ),
        ordersChange: calcChange(currentOrdersCount, previousOrdersCount),
        customersChange: calcChange(currentCustomersCount, previousCustomersCount),
        productsChange: calcChange(currentProductsCount, previousProductsCount),
        // Sales
        salesByDay: salesByDay.map(s => ({
          date: s.createdAt,
          revenue: Number(s._sum.total || 0),
          orders: s._count.id,
        })),
        topProducts: await Promise.all(topProductGroups.map(async g => {
          const product = products.find(p => p.id === g.productId);
          const imageKey = product?.images?.[0]?.imageKey;
          return {
            id: g.productId,
            name: product?.name || 'Unknown',
            sales: g._sum.quantity || 0,
            revenue: Number(g._sum.price || 0),
            stock: product?.stock || 0,
            image: imageKey ? await this.s3Service.getSignedUrl(imageKey) : null,
          };
        })),
        recentOrders: recentOrders.map(order => ({
          id: order.orderNumber,
          customer: order.user?.name || order.user?.email || 'Unknown',
          amount: Number(order.total),
          status: order.status.toLowerCase(),
          date: order.createdAt,
          items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        })),
        // Product analytics
        lowStockProducts: lowStockCount,
        outOfStockProducts: outOfStockCount,
        topRatedProducts: productsWithRatings.slice(0, 5),
        // Customer analytics
        newCustomers,
        activeCustomers: activeCustomers.length,
        topCustomers: customersWithTotals.slice(0, 5),
      },
      message: 'Analytics overview retrieved successfully',
      errors: [],
    };
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
              },
            },
            variant: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      success: true,
      data: order,
      message: 'Order retrieved successfully',
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

  async getAllUsers(page = 1, limit = 10, role?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) where.role = role.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

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

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true } },
        addresses: {
          orderBy: { isDefault: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get recent orders
    const recentOrders = await this.prisma.order.findMany({
      where: { userId: id },
      include: {
        items: {
          take: 3,
          include: {
            product: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Get total spent
    const orderAgg = await this.prisma.order.aggregate({
      where: { userId: id, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    });

    return {
      success: true,
      data: {
        ...user,
        recentOrders,
        totalSpent: orderAgg._sum.total || 0,
      },
      message: 'User retrieved successfully',
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

  async getAllReviews(
    page = 1,
    limit = 10,
    filters?: {
      productId?: string;
      userId?: string;
      rating?: number;
      isActive?: boolean;
      search?: string;
    },
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters?.productId) where.productId = filters.productId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.rating) where.rating = filters.rating;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;
    if (filters?.search) {
      where.OR = [
        { content: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          product: {
            select: {
              id: true,
              name: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { imageKey: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    const reviewsWithImages = await Promise.all(
      reviews.map(async (review) => {
        const imageKey = review.product?.images?.[0]?.imageKey;
        const productImage = imageKey
          ? await this.s3Service.getSignedUrl(imageKey)
          : null;
        return {
          ...review,
          product: {
            id: review.product.id,
            name: review.product.name,
            image: productImage,
          },
        };
      }),
    );

    return {
      success: true,
      data: {
        reviews: reviewsWithImages,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Reviews retrieved successfully',
      errors: [],
    };
  }

  async getReviewById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: {
          select: {
            id: true,
            name: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' }, select: { imageKey: true } },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const imageKey = review.product?.images?.[0]?.imageKey;
    const productImage = imageKey
      ? await this.s3Service.getSignedUrl(imageKey)
      : null;

    return {
      success: true,
      data: {
        ...review,
        product: {
          id: review.product.id,
          name: review.product.name,
          image: productImage,
        },
      },
      message: 'Review retrieved successfully',
      errors: [],
    };
  }

  async toggleReviewActive(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: { isActive: !review.isActive },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      success: true,
      data: updated,
      message: `Review ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      errors: [],
    };
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: 'Review deleted successfully',
      errors: [],
    };
  }
}
