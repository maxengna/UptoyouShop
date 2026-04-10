import { AddressType } from "@prisma/client";
export declare class CreateAddressDto {
    type: AddressType;
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
    isDefault?: boolean;
}
