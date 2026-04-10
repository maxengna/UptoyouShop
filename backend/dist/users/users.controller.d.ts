import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            emailVerified: boolean;
            avatar: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
        errors: never[];
    }>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<{
        success: boolean;
        data: {
            id: string;
            email: string;
            name: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            avatar: string | null;
            phone: string | null;
            updatedAt: Date;
        };
        message: string;
        errors: never[];
    }>;
    getAddresses(userId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.AddressType;
            firstName: string;
            lastName: string;
            company: string | null;
            address1: string;
            address2: string | null;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            isDefault: boolean;
        }[];
        message: string;
        errors: never[];
    }>;
    addAddress(userId: string, createAddressDto: CreateAddressDto): Promise<{
        success: boolean;
        data: {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.AddressType;
            firstName: string;
            lastName: string;
            company: string | null;
            address1: string;
            address2: string | null;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            isDefault: boolean;
        };
        message: string;
        errors: never[];
    }>;
    updateAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto): Promise<{
        success: boolean;
        data: {
            id: string;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            type: import(".prisma/client").$Enums.AddressType;
            firstName: string;
            lastName: string;
            company: string | null;
            address1: string;
            address2: string | null;
            city: string;
            state: string;
            zipCode: string;
            country: string;
            isDefault: boolean;
        };
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
            orders: ({
                items: ({
                    product: {
                        id: string;
                        name: string;
                        slug: string;
                        images: {
                            id: string;
                            createdAt: Date;
                            isMain: boolean;
                            productId: string;
                            url: string;
                            alt: string | null;
                            sortOrder: number;
                        }[];
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    price: import("@prisma/client/runtime/library").Decimal;
                    orderId: string;
                    productId: string;
                    quantity: number;
                    variantId: string | null;
                    productSnapshot: import("@prisma/client/runtime/library").JsonValue;
                })[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string | null;
                orderNumber: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
                paymentMethod: string | null;
                subtotal: import("@prisma/client/runtime/library").Decimal;
                tax: import("@prisma/client/runtime/library").Decimal;
                shipping: import("@prisma/client/runtime/library").Decimal;
                total: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                shippingAddress: import("@prisma/client/runtime/library").JsonValue;
                billingAddress: import("@prisma/client/runtime/library").JsonValue | null;
                notes: string | null;
                trackingNumber: string | null;
                shippedAt: Date | null;
                deliveredAt: Date | null;
            })[];
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
    getWishlist(userId: string): Promise<{
        success: boolean;
        data: {
            wishlistItems: {
                id: string;
                productId: string;
                wishlistId: string;
                addedAt: Date;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isPublic: boolean;
            shareToken: string | null;
        };
        message: string;
        errors: never[];
    }>;
    addToWishlist(userId: string, productId: string): Promise<{
        success: boolean;
        data: {
            id: string;
            productId: string;
            wishlistId: string;
            addedAt: Date;
        };
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
