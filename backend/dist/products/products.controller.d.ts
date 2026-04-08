import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(query: ProductQueryDto): Promise<{
        success: boolean;
        data: {
            products: any;
            pagination: {
                page: number;
                limit: number;
                total: any;
                pages: number;
                hasNext: boolean;
                hasPrev: boolean;
            };
        };
        message: string;
        errors: never[];
    }>;
    getProductById(id: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
    createProduct(createProductDto: CreateProductDto): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
    updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
    deleteProduct(id: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    getProductReviews(id: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            reviews: any;
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
}
