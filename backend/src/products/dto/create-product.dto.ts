import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Min,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class DimensionsDto {
  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  length: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  width: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  @Min(0)
  height: number;
}

class ImageDto {
  @ApiProperty({ example: 'https://example.com/image.jpg' })
  @IsString()
  url: string;

  @ApiPropertyOptional({ example: 'Product image' })
  @IsOptional()
  @IsString()
  alt?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isMain?: boolean;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: 'wireless-headphones' })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiPropertyOptional({ example: 'High-quality wireless headphones with noise cancellation' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 129.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  @Length(1, 100)
  sku: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 'category-id' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isNew?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isOnSale?: boolean;

  @ApiPropertyOptional({ example: ['electronics', 'audio'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ type: DimensionsDto })
  @IsOptional()
  dimensions?: DimensionsDto;

  @ApiPropertyOptional({ example: 'Best Wireless Headphones' })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Premium wireless headphones with active noise cancellation' })
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional({ type: [ImageDto] })
  @IsOptional()
  @IsArray()
  images?: ImageDto[];
}
