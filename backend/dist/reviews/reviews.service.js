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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProductReviews(productId, page = 1, limit = 10) {
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
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
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
    async createReview(userId, createReviewDto) {
        const { productId, orderId, rating, title, content } = createReviewDto;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const existingReview = await this.prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId,
                    userId,
                },
            },
        });
        if (existingReview) {
            throw new common_1.ConflictException('You have already reviewed this product');
        }
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
                throw new common_1.ForbiddenException('You can only review products you have purchased');
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
    async updateReview(userId, reviewId, updateReviewDto) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own reviews');
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
    async deleteReview(userId, reviewId) {
        const review = await this.prisma.review.findUnique({
            where: { id: reviewId },
        });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
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
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map