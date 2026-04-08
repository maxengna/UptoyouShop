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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
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
            const newCart = await this.prisma.cart.create({
                data: {
                    userId,
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
                include: { items: true },
            });
            return {
                success: true,
                data: newCart,
                message: 'Cart retrieved successfully',
                errors: [],
            };
        }
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
            message: 'Cart retrieved successfully',
            errors: [],
        };
    }
    async addItem(userId, addCartItemDto) {
        const { productId, quantity, variantId } = addCartItemDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: variantId ? { where: { id: variantId } } : false,
                inventory: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const availableStock = variantId
            ? product.variants?.[0]?.stock || product.stock
            : product.stock;
        if (availableStock < quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
        }
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
        const existingItem = await this.prisma.cartItem.findUnique({
            where: {
                cartId_productId_variantId: {
                    cartId: cart.id,
                    productId,
                    variantId: variantId || null,
                },
            },
        });
        if (existingItem) {
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
                message: 'Cart item updated',
                errors: [],
            };
        }
        const price = variantId && product.variants?.[0]?.price
            ? product.variants[0].price
            : product.price;
        const cartItem = await this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                price,
                variantId: variantId || null,
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
            message: 'Item added to cart',
            errors: [],
        };
    }
    async updateItem(userId, cartItemId, updateCartItemDto) {
        const { quantity } = updateCartItemDto;
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const cartItem = await this.prisma.cartItem.findFirst({
            where: { id: cartItemId, cartId: cart.id },
            include: { product: true, variant: true },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (quantity === 0) {
            await this.prisma.cartItem.delete({
                where: { id: cartItemId },
            });
            return {
                success: true,
                data: null,
                message: 'Item removed from cart',
                errors: [],
            };
        }
        const availableStock = cartItem.variantId
            ? cartItem.variant?.stock || cartItem.product.stock
            : cartItem.product.stock;
        if (availableStock < quantity) {
            throw new common_1.BadRequestException(`Insufficient stock for ${cartItem.product.name}`);
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
            message: 'Cart item updated',
            errors: [],
        };
    }
    async removeItem(userId, cartItemId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const cartItem = await this.prisma.cartItem.findFirst({
            where: { id: cartItemId, cartId: cart.id },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.prisma.cartItem.delete({
            where: { id: cartItemId },
        });
        return {
            success: true,
            data: null,
            message: 'Item removed from cart',
            errors: [],
        };
    }
    async clearCart(userId) {
        const cart = await this.prisma.cart.findUnique({
            where: { userId },
        });
        if (!cart) {
            return {
                success: true,
                data: null,
                message: 'Cart is already empty',
                errors: [],
            };
        }
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        return {
            success: true,
            data: null,
            message: 'Cart cleared successfully',
            errors: [],
        };
    }
    async applyCoupon(userId, code) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('Invalid coupon code');
        }
        if (!coupon.isActive) {
            throw new common_1.BadRequestException('Coupon is no longer active');
        }
        if (coupon.startsAt > new Date()) {
            throw new common_1.BadRequestException('Coupon is not yet valid');
        }
        if (coupon.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new common_1.BadRequestException('Coupon usage limit reached');
        }
        return {
            success: true,
            data: coupon,
            message: 'Coupon applied successfully',
            errors: [],
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
//# sourceMappingURL=cart.service.js.map