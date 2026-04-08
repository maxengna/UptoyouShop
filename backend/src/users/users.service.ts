import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
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
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      data: user,
      message: 'Profile retrieved successfully',
      errors: [],
    };
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
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

  async getAddresses(userId: string) {
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

  async addAddress(userId: string, createAddressDto: CreateAddressDto) {
    // If this is the first address or set as default, unset other defaults
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

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ) {
    // Verify address belongs to user
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default, unset other defaults
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

  async deleteAddress(userId: string, addressId: string) {
    // Verify address belongs to user
    const existingAddress = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!existingAddress) {
      throw new NotFoundException('Address not found');
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

  async getUserOrders(userId: string, page = 1, limit = 10) {
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

  async getWishlist(userId: string) {
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
      // Create empty wishlist if doesn't exist
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

  async addToWishlist(userId: string, productId: string) {
    // Get or create wishlist
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: { userId },
      });
    }

    // Check if product already in wishlist
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

    // Add to wishlist
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

  async removeFromWishlist(userId: string, wishlistItemId: string) {
    // Verify wishlist item belongs to user
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: { id: wishlistItemId, wishlistId: wishlist.id },
    });

    if (!wishlistItem) {
      throw new NotFoundException('Wishlist item not found');
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
}
