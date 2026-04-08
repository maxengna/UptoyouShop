import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProductReviews(productId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total, stats] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, isActive: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { productId, isActive: true },
      }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { productId, isActive: true },
        _count: { rating: true },
      }),
    ]);

    // Calculate rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    stats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
      totalRating += stat.rating * stat._count.rating;
    });

    const averageRating = total > 0 ? totalRating / total : 0;

    return {
      success: true,
      data: {
        reviews,
        stats: {
          averageRating,
          totalReviews: total,
          ratingDistribution,
        },
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

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, orderId, rating, title, content } = createReviewDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }

    // If orderId provided, verify user has purchased the product
    if (orderId) {
      const order = await this.prisma.order.findFirst({
        where: {
          id: orderId,
          userId,
          items: {
            some: { productId },
          },
        },
      });

      if (!order) {
        throw new ForbiddenException(
          'You can only review products you have purchased',
        );
      }
    }

    const review = await this.prisma.review.create({
      data: {
        productId,
        userId,
        orderId: orderId || null,
        rating,
        title,
        content,
        isVerified: !!orderId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: review,
      message: 'Review created successfully',
      errors: [],
    };
  }

  async updateReview(
    userId: string,
    reviewId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      data: updatedReview,
      message: 'Review updated successfully',
      errors: [],
    };
  }

  async deleteReview(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return {
      success: true,
      data: null,
      message: 'Review deleted successfully',
      errors: [],
    };
  }
}
