export declare enum SortBy {
    PRICE_ASC = "price-asc",
    PRICE_DESC = "price-desc",
    NAME_ASC = "name-asc",
    NAME_DESC = "name-desc",
    NEWEST = "newest",
    RATING = "rating"
}
export declare class ProductQueryDto {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: SortBy;
    inStock?: boolean;
}
