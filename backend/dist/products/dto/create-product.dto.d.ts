declare class DimensionsDto {
    length: number;
    width: number;
    height: number;
}
declare class ImageDto {
    url: string;
    alt?: string;
    sortOrder?: number;
    isMain?: boolean;
}
export declare class CreateProductDto {
    name: string;
    slug: string;
    description?: string;
    price: number;
    originalPrice?: number;
    sku: string;
    stock?: number;
    categoryId: string;
    isActive?: boolean;
    isNew?: boolean;
    isOnSale?: boolean;
    tags?: string[];
    weight?: number;
    dimensions?: DimensionsDto;
    seoTitle?: string;
    seoDescription?: string;
    images?: ImageDto[];
}
export {};
