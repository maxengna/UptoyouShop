declare class OrderItemDto {
    productId: string;
    quantity: number;
    variantId?: string;
}
declare class AddressDto {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    shippingAddress: AddressDto;
    billingAddress?: AddressDto;
    paymentMethod: string;
    notes?: string;
}
export {};
