import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../database/prisma'
import { z } from 'zod'

// Admin authentication check
async function requireAdmin() {
  const session = await getServerSession()
  
  if (!session?.user?.email) {
    return {
      success: false,
      error: 'Unauthorized',
      status: 401,
    }
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return {
      success: false,
      error: 'Insufficient permissions',
      status: 403,
    }
  }

  return { success: true, user }
}

// Get all orders for admin
export async function getAdminOrders(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('paymentStatus')

    // Build where clause
    const where: any = {}
    if (status) where.status = status.toUpperCase()
    if (paymentStatus) where.paymentStatus = paymentStatus.toUpperCase()

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.order.count({ where })

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
    }
  } catch (error) {
    console.error('Get admin orders error:', error)
    return {
      success: false,
      error: 'Failed to fetch orders',
      status: 500,
    }
  }
}

// Update order status for admin
export async function updateAdminOrderStatus(orderId: string, request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    const body = await request.json()
    const { status, trackingNumber } = z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
      trackingNumber: z.string().optional(),
    }).parse(body)

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(status === 'SHIPPED' && { shippedAt: new Date() }),
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update inventory when order is shipped/delivered
    if (status === 'SHIPPED' || status === 'DELIVERED') {
      for (const item of order.items) {
        await prisma.inventory.update({
          where: { productId: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            reserved: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    // Release inventory if order is cancelled
    if (status === 'CANCELLED') {
      for (const item of order.items) {
        await prisma.inventory.update({
          where: { productId: item.productId },
          data: {
            reserved: {
              decrement: item.quantity,
            },
          },
        })
      }
    }

    return {
      success: true,
      data: order,
      message: 'Order status updated successfully',
    }
  } catch (error) {
    console.error('Update admin order status error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid request data',
        details: error.errors,
        status: 400,
      }
    }

    return {
      success: false,
      error: 'Failed to update order status',
      status: 500,
    }
  }
}

// Get sales analytics
export async function getSalesAnalytics(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get sales data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get top products
    const productSales = new Map()
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.productId
        const productName = item.product.name
        const quantity = item.quantity
        const revenue = Number(item.price) * quantity

        if (productSales.has(productId)) {
          const existing = productSales.get(productId)
          existing.quantity += quantity
          existing.revenue += revenue
        } else {
          productSales.set(productId, {
            productId,
            productName,
            quantity,
            revenue,
          })
        }
      })
    })

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Get daily sales data
    const dailySales = new Map()
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]
      const revenue = Number(order.total)
      
      if (dailySales.has(date)) {
        dailySales.set(date, dailySales.get(date) + revenue)
      } else {
        dailySales.set(date, revenue)
      }
    })

    const salesChart = Array.from(dailySales.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        salesChart,
        period: parseInt(period),
      },
    }
  } catch (error) {
    console.error('Get sales analytics error:', error)
    return {
      success: false,
      error: 'Failed to fetch sales analytics',
      status: 500,
    }
  }
}

// Get product analytics
export async function getProductAnalytics(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    // Get product metrics
    const products = await prisma.product.findMany({
      include: {
        category: true,
        reviews: {
          select: { rating: true },
        },
        orderItems: {
          select: {
            quantity: true,
            price: true,
          },
        },
        inventory: true,
      },
    })

    // Calculate product metrics
    const productAnalytics = products.map(product => {
      const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      const totalRevenue = product.orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
      const averageRating = product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
        : 0

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category.name,
        price: Number(product.price),
        stock: product.stock,
        totalSold,
        totalRevenue,
        averageRating,
        reviewCount: product.reviews.length,
        isActive: product.isActive,
      }
    })

    // Sort by revenue
    productAnalytics.sort((a, b) => b.totalRevenue - a.totalRevenue)

    return {
      success: true,
      data: productAnalytics,
    }
  } catch (error) {
    console.error('Get product analytics error:', error)
    return {
      success: false,
      error: 'Failed to fetch product analytics',
      status: 500,
    }
  }
}

// Get customer analytics
export async function getCustomerAnalytics(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get customer data
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      include: {
        orders: {
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    })

    // Calculate customer metrics
    const customerAnalytics = customers.map(customer => {
      const orders = customer.orders
      const totalSpent = orders.reduce((sum, order) => sum + Number(order.total), 0)
      const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        emailVerified: customer.emailVerified,
        createdAt: customer.createdAt,
        totalOrders: orders.length,
        totalSpent,
        averageOrderValue,
        lastOrderDate: orders.length > 0 ? orders[orders.length - 1].createdAt : null,
      }
    })

    // Sort by total spent
    customerAnalytics.sort((a, b) => b.totalSpent - a.totalSpent)

    // Calculate overall metrics
    const totalCustomers = customers.length
    const activeCustomers = customers.filter(c => c.orders.length > 0).length
    const newCustomers = customers.filter(c => c.createdAt >= startDate).length

    return {
      success: true,
      data: {
        customers: customerAnalytics,
        summary: {
          totalCustomers,
          activeCustomers,
          newCustomers,
          period: parseInt(period),
        },
      },
    }
  } catch (error) {
    console.error('Get customer analytics error:', error)
    return {
      success: false,
      error: 'Failed to fetch customer analytics',
      status: 500,
    }
  }
}

// Get system health
export async function getSystemHealth() {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    // Get database stats
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.inventory.count({
        where: { quantity: { lte: 5 } },
      }),
    ])

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Get top products
    const topProducts = await prisma.product.findMany({
      take: 5,
      include: {
        orderItems: {
          select: {
            quantity: true,
          },
        },
      },
    })

    const productsWithSales = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    })).sort((a, b) => b.totalSold - a.totalSold)

    return {
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: Number(totalRevenue._sum.total || 0),
          lowStockProducts,
        },
        recentOrders,
        topProducts: productsWithSales,
      },
    }
  } catch (error) {
    console.error('Get system health error:', error)
    return {
      success: false,
      error: 'Failed to fetch system health',
      status: 500,
    }
  }
}

// Get all users for admin
export async function getAdminUsers(request: NextRequest) {
  try {
    const authResult = await requireAdmin()
    if (!authResult.success) return authResult

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {}
    if (role) where.role = role.toUpperCase()
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get users
    const users = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        addresses: {
          select: {
            id: true,
            type: true,
            isDefault: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    })

    // Get total count
    const total = await prisma.user.count({ where })

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
    }
  } catch (error) {
    console.error('Get admin users error:', error)
    return {
      success: false,
      error: 'Failed to fetch users',
      status: 500,
    }
  }
}
