import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            reviews: ({
                user: {
                    name: string | null;
                    id: string;
                } | null;
            } & {
                title: string | null;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                content: string;
                isActive: boolean;
                orderId: string | null;
                productId: string;
                rating: number;
                isVerified: boolean;
            })[];
            stats: {
                averageRating: number;
                totalReviews: number;
                ratingDistribution: Record<number, number>;
            };
            pagination: {
                page: number;
                limit: number;
                total: number;
                pages: number;
            };
        };
        message: string;
        errors: never[];
    }>;
    createReview(userId: string, createReviewDto: CreateReviewDto): Promise<{
        success: boolean;
        data: {
            user: {
                name: string | null;
                id: string;
            } | null;
        } & {
            title: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            content: string;
            isActive: boolean;
            orderId: string | null;
            productId: string;
            rating: number;
            isVerified: boolean;
        };
        message: string;
        errors: never[];
    }>;
    updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto): Promise<{
        success: boolean;
        data: {
            user: {
                name: string | null;
                id: string;
            } | null;
        } & {
            title: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string | null;
            content: string;
            isActive: boolean;
            orderId: string | null;
            productId: string;
            rating: number;
            isVerified: boolean;
        };
        message: string;
        errors: never[];
    }>;
    deleteReview(userId: string, reviewId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
}
