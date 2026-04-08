import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    getAddresses(userId: string): Promise<{
        success: boolean;
        data: $Public.PrismaPromise<T>;
        message: string;
        errors: never[];
    }>;
    addAddress(userId: string, createAddressDto: CreateAddressDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$AddressPayload<ExtArgs>, T, "create", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$AddressPayload<ExtArgs>, T, "update", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    deleteAddress(userId: string, addressId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
    getUserOrders(userId: string, page?: number, limit?: number): Promise<{
        success: boolean;
        data: {
            orders: any;
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
    getWishlist(userId: string): Promise<{
        success: boolean;
        data: $Result.GetResult<import(".prisma/client").Prisma.$WishlistPayload<ExtArgs>, T, "create", GlobalOmitOptions>;
        message: string;
        errors: never[];
    }>;
    addToWishlist(userId: string, productId: string): Promise<{
        success: boolean;
        data: any;
        message: string;
        errors: never[];
    }>;
    removeFromWishlist(userId: string, wishlistItemId: string): Promise<{
        success: boolean;
        data: null;
        message: string;
        errors: never[];
    }>;
}
