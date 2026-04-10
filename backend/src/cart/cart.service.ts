import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddCartItemDto } from "./dto/add-cart-item.dto";
import { UpdateCartItemDto } from "./dto/update-cart-item.dto";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isMain: true },
                  take: 1,
                },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      // Create empty cart
      const newCart = await this.prisma.cart.create({
        data: {
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        include: { items: true },
      });

      return {
        success: true,
        data: newCart,
        message: "Cart retrieved successfully",
        errors: [],
      };
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    return {
      success: true,
      data: {
        ...cart,
        subtotal,
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
      message: "Cart retrieved successfully",
      errors: [],
    };
  }

  async addItem(userId: string, addCartItemDto: AddCartItemDto) {
    const { productId, quantity, variantId } = addCartItemDto;

    // Check product exists and has stock
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: variantId ? { where: { id: variantId } } : false,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    // Check stock
    const availableStock = variantId
      ? product.variants?.[0]?.stock || product.stock
      : product.stock;

    if (availableStock < quantity) {
      throw new BadRequestException(`Insufficient stock for ${product.name}`);
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Check if item already in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || "",
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: {
          product: {
            include: {
              images: { where: { isMain: true }, take: 1 },
            },
          },
          variant: true,
        },
      });

      return {
        success: true,
        data: updatedItem,
        message: "Cart item updated",
        errors: [],
      };
    }

    // Get variant price if applicable
    const price =
      variantId && product.variants?.[0]?.price
        ? product.variants[0].price
        : product.price;

    // Add new item
    const cartItem = await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price,
        variantId: variantId || "",
      },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
          },
        },
        variant: true,
      },
    });

    return {
      success: true,
      data: cartItem,
      message: "Item added to cart",
      errors: [],
    };
  }

  async updateItem(
    userId: string,
    cartItemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const { quantity } = updateCartItemDto;

    // Verify cart item belongs to user
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
      include: { product: true, variant: true },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (quantity === 0) {
      // Remove item
      await this.prisma.cartItem.delete({
        where: { id: cartItemId },
      });

      return {
        success: true,
        data: null,
        message: "Item removed from cart",
        errors: [],
      };
    }

    // Check stock
    const availableStock = cartItem.variantId
      ? cartItem.variant?.stock || cartItem.product.stock
      : cartItem.product.stock;

    if (availableStock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for ${cartItem.product.name}`,
      );
    }

    const updatedItem = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: {
        product: {
          include: {
            images: { where: { isMain: true }, take: 1 },
          },
        },
        variant: true,
      },
    });

    return {
      success: true,
      data: updatedItem,
      message: "Cart item updated",
      errors: [],
    };
  }

  async removeItem(userId: string, cartItemId: string) {
    // Verify cart item belongs to user
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException("Cart not found");
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return {
      success: true,
      data: null,
      message: "Item removed from cart",
      errors: [],
    };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      return {
        success: true,
        data: null,
        message: "Cart is already empty",
        errors: [],
      };
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      success: true,
      data: null,
      message: "Cart cleared successfully",
      errors: [],
    };
  }

  async applyCoupon(userId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      throw new NotFoundException("Invalid coupon code");
    }

    if (!coupon.isActive) {
      throw new BadRequestException("Coupon is no longer active");
    }

    if (coupon.startsAt > new Date()) {
      throw new BadRequestException("Coupon is not yet valid");
    }

    if (coupon.expiresAt < new Date()) {
      throw new BadRequestException("Coupon has expired");
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException("Coupon usage limit reached");
    }

    return {
      success: true,
      data: coupon,
      message: "Coupon applied successfully",
      errors: [],
    };
  }
}
