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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            success: true,
            data: user,
            message: 'Profile retrieved successfully',
            errors: [],
        };
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: updateProfileDto,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                updatedAt: true,
            },
        });
        return {
            success: true,
            data: user,
            message: 'Profile updated successfully',
            errors: [],
        };
    }
    async getAddresses(userId) {
        const addresses = await this.prisma.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
        return {
            success: true,
            data: addresses,
            message: 'Addresses retrieved successfully',
            errors: [],
        };
    }
    async addAddress(userId, createAddressDto) {
        if (createAddressDto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }
        const address = await this.prisma.address.create({
            data: {
                ...createAddressDto,
                userId,
            },
        });
        return {
            success: true,
            data: address,
            message: 'Address added successfully',
            errors: [],
        };
    }
    async updateAddress(userId, addressId, updateAddressDto) {
        const existingAddress = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!existingAddress) {
            throw new common_1.NotFoundException('Address not found');
        }
        if (updateAddressDto.isDefault) {
            await this.prisma.address.updateMany({
                where: { userId, isDefault: true, id: { not: addressId } },
                data: { isDefault: false },
            });
        }
        const address = await this.prisma.address.update({
            where: { id: addressId },
            data: updateAddressDto,
        });
        return {
            success: true,
            data: address,
            message: 'Address updated successfully',
            errors: [],
        };
    }
    async deleteAddress(userId, addressId) {
        const existingAddress = await this.prisma.address.findFirst({
            where: { id: addressId, userId },
        });
        if (!existingAddress) {
            throw new common_1.NotFoundException('Address not found');
        }
        await this.prisma.address.delete({
            where: { id: addressId },
        });
        return {
            success: true,
            data: null,
            message: 'Address deleted successfully',
            errors: [],
        };
    }
    async getUserOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    images: {
                                        where: { isMain: true },
                                        take: 1,
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.order.count({ where: { userId } }),
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
    async getWishlist(userId) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
            include: {
                wishlistItems: {
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isMain: true },
                                    take: 1,
                                },
                                category: {
                                    select: { name: true, slug: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!wishlist) {
            const newWishlist = await this.prisma.wishlist.create({
                data: { userId },
                include: { wishlistItems: true },
            });
            return {
                success: true,
                data: newWishlist,
                message: 'Wishlist retrieved successfully',
                errors: [],
            };
        }
        return {
            success: true,
            data: wishlist,
            message: 'Wishlist retrieved successfully',
            errors: [],
        };
    }
    async addToWishlist(userId, productId) {
        let wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
        });
        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({
                data: { userId },
            });
        }
        const existingItem = await this.prisma.wishlistItem.findUnique({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
        });
        if (existingItem) {
            return {
                success: true,
                data: existingItem,
                message: 'Product already in wishlist',
                errors: [],
            };
        }
        const wishlistItem = await this.prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId,
            },
            include: {
                product: {
                    include: {
                        images: { where: { isMain: true }, take: 1 },
                    },
                },
            },
        });
        return {
            success: true,
            data: wishlistItem,
            message: 'Product added to wishlist',
            errors: [],
        };
    }
    async removeFromWishlist(userId, wishlistItemId) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
        });
        if (!wishlist) {
            throw new common_1.NotFoundException('Wishlist not found');
        }
        const wishlistItem = await this.prisma.wishlistItem.findFirst({
            where: { id: wishlistItemId, wishlistId: wishlist.id },
        });
        if (!wishlistItem) {
            throw new common_1.NotFoundException('Wishlist item not found');
        }
        await this.prisma.wishlistItem.delete({
            where: { id: wishlistItemId },
        });
        return {
            success: true,
            data: null,
            message: 'Product removed from wishlist',
            errors: [],
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map