import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$CartPayload<ExtArgs>, T, "create", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    addItem(userId: string, addCartItemDto: AddCartItemDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$CartItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    updateItem(userId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$CartItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    removeItem(userId: string, cartItemId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    clearCart(userId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    applyCoupon(userId: string, code: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
}
