import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            reviews: any;
            stats: {
                averageRating: number;
                totalReviews: any;
                ratingDistribution: Record<number, number>;
            };
            pagination: {
                page: number;
                limit: number;
                total: any;
                pages: number;
            };
        };
        message: string;
        errors: never[];
    }>;
    createReview(userId: string, createReviewDto: CreateReviewDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$ReviewPayload<ExtArgs>, T, "create", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    updateReview(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$ReviewPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
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
