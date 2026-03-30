import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../database/prisma'
import { z } from 'zod'

// Create order schema
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    variantId: z.string().optional(),
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }),
  billingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    company: z.string().optional(),
    address1: z.string(),
    address2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }),
  paymentMethod: z.string(),
  notes: z.string().optional(),
})

export async function getOrders(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 404,
      }
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = { userId: user.id }
    if (status) {
      where.status = status.toUpperCase()
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
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
    console.error('Get orders error:', error)
    return {
      success: false,
      error: 'Failed to fetch orders',
      status: 500,
    }
  }
}

export async function createOrder(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      }
    }

    const body = await request.json()
    const validatedData = createOrderSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 404,
      }
    }

    // Validate products and calculate totals
    let subtotal = 0
    const orderItems: any[] = []

    for (const item of validatedData.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          inventory: true,
          variants: item.variantId ? { where: { id: item.variantId } } : false,
        },
      })

      if (!product) {
        return {
          success: false,
          error: `Product ${item.productId} not found`,
          status: 404,
        }
      }

      // Check stock
      const availableStock = item.variantId 
        ? product.variants?.[0]?.stock || product.stock
        : product.stock

      if (availableStock < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${product.name}`,
          status: 400,
        }
      }

      const itemTotal = Number(product.price) * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        variantId: item.variantId,
        price: product.price,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          images: product.images,
        },
      })
    }

    // Calculate totals
    const tax = subtotal * 0.08 // 8% tax rate
    const shipping = subtotal > 50 ? 0 : 9.99 // Free shipping over $50
    const total = subtotal + tax + shipping

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: validatedData.paymentMethod,
        subtotal,
        tax,
        shipping,
        total,
        currency: 'USD',
        shippingAddress: validatedData.shippingAddress,
        billingAddress: validatedData.billingAddress,
        notes: validatedData.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
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
      },
    })

    // Reserve inventory
    for (const item of validatedData.items) {
      await prisma.inventory.update({
        where: { productId: item.productId },
        data: {
          reserved: {
            increment: item.quantity,
          },
        },
      })
    }

    // Clear user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    })

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
    }

    return {
      success: true,
      data: order,
      message: 'Order created successfully',
    }
  } catch (error) {
    console.error('Create order error:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid order data',
        details: error.errors,
        status: 400,
      }
    }

    return {
      success: false,
      error: 'Failed to create order',
      status: 500,
    }
  }
}

export async function getOrderById(orderId: string) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 404,
      }
    }

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id, // Ensure user can only access their own orders
      },
      include: {
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
    })

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
        status: 404,
      }
    }

    return {
      success: true,
      data: order,
    }
  } catch (error) {
    console.error('Get order error:', error)
    return {
      success: false,
      error: 'Failed to fetch order',
      status: 500,
    }
  }
}

export async function updateOrderStatus(orderId: string, request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'Unauthorized',
        status: 401,
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 404,
      }
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403,
      }
    }

    const body = await request.json()
    const { status } = z.object({
      status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    }).parse(body)

    // Update order
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { 
        status,
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
    console.error('Update order status error:', error)
    
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

export async function getOrderTracking(orderNumber: string) {
  try {
    const order = await prisma.order.findUnique({
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
    })

    if (!order) {
      return {
        success: false,
        error: 'Order not found',
        status: 404,
      }
    }

    return {
      success: true,
      data: order,
    }
  } catch (error) {
    console.error('Get order tracking error:', error)
    return {
      success: false,
      error: 'Failed to fetch order tracking',
      status: 500,
    }
  }
}
