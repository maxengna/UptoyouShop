import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '../database/prisma'
import { z } from 'zod'

// Get user's cart
export async function getCart(request: NextRequest) {
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

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
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
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
        },
      })
    }

    // Calculate cart totals
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    )

    const itemCount = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    )

    return {
      success: true,
      data: {
        cart: {
          ...cart,
          subtotal,
          itemCount,
        },
      },
    }
  } catch (error) {
    console.error('Get cart error:', error)
    return {
      success: false,
      error: 'Failed to fetch cart',
      status: 500,
    }
  }
}

// Add item to cart schema
const addItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
  variantId: z.string().optional(),
})

export async function addToCart(request: NextRequest) {
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
    const { productId, quantity, variantId } = addItemSchema.parse(body)

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

    // Check product exists and has sufficient stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventory: true,
        variants: variantId ? { where: { id: variantId } } : false,
      },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
        status: 404,
      }
    }

    // Check stock
    const availableStock = variantId 
      ? product.variants?.[0]?.stock || product.stock
      : product.stock

    if (availableStock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock',
        status: 400,
      }
    }

    // Get or create cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId,
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      
      if (availableStock < newQuantity) {
        return {
          success: false,
          error: 'Insufficient stock',
          status: 400,
        }
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      })
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          variantId,
          price: product.price,
        },
      })
    }

    // Get updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
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
      },
    })

    // Calculate totals
    const subtotal = updatedCart?.items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    ) || 0

    const itemCount = updatedCart?.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    ) || 0

    return {
      success: true,
      data: {
        cart: {
          ...updatedCart,
          subtotal,
          itemCount,
        },
      },
      message: 'Item added to cart',
    }
  } catch (error) {
    console.error('Add to cart error:', error)
    
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
      error: 'Failed to add item to cart',
      status: 500,
    }
  }
}

export async function updateCartItem(itemId: string, request: NextRequest) {
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
    const { quantity } = z.object({
      quantity: z.number().min(1),
    }).parse(body)

    // Find cart item with user verification
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: (await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
          }))?.id,
        },
      },
      include: {
        product: {
          include: {
            inventory: true,
            variants: true,
          },
        },
        variant: true,
      },
    })

    if (!cartItem) {
      return {
        success: false,
        error: 'Cart item not found',
        status: 404,
      }
    }

    // Check stock
    const availableStock = cartItem.variantId 
      ? cartItem.product.variants?.find(v => v.id === cartItem.variantId)?.stock || cartItem.product.stock
      : cartItem.product.stock

    if (availableStock < quantity) {
      return {
        success: false,
        error: 'Insufficient stock',
        status: 400,
      }
    }

    // Update cart item
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        cart: {
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
          },
        },
      },
    })

    // Calculate new cart totals
    const cart = updatedItem.cart
    const subtotal = cart.items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    )

    const itemCount = cart.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    )

    return {
      success: true,
      data: {
        cart: {
          ...cart,
          subtotal,
          itemCount,
        },
      },
      message: 'Cart item updated',
    }
  } catch (error) {
    console.error('Update cart item error:', error)
    
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
      error: 'Failed to update cart item',
      status: 500,
    }
  }
}

export async function removeCartItem(itemId: string) {
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

    // Find and delete cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: user.id,
        },
      },
    })

    if (!cartItem) {
      return {
        success: false,
        error: 'Cart item not found',
        status: 404,
      }
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    // Get updated cart
    const cart = await prisma.cart.findUnique({
      where: { id: cartItem.cartId },
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
      },
    })

    // Calculate new totals
    const subtotal = cart?.items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * item.quantity,
      0
    ) || 0

    const itemCount = cart?.items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0
    ) || 0

    return {
      success: true,
      data: {
        cart: {
          ...cart,
          subtotal,
          itemCount,
        },
      },
      message: 'Cart item removed',
    }
  } catch (error) {
    console.error('Remove cart item error:', error)
    return {
      success: false,
      error: 'Failed to remove cart item',
      status: 500,
    }
  }
}

export async function clearCart() {
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

    // Find and clear cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    })

    if (!cart) {
      return {
        success: false,
        error: 'No active cart found',
        status: 404,
      }
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    return {
      success: true,
      message: 'Cart cleared successfully',
    }
  } catch (error) {
    console.error('Clear cart error:', error)
    return {
      success: false,
      error: 'Failed to clear cart',
      status: 500,
    }
  }
}
