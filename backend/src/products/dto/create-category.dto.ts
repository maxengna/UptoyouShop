import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Length,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({ example: "Electronics" })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: "electronics" })
  @IsString()
  @Length(1, 255)
  slug: string;

  @ApiPropertyOptional({ example: "Electronic devices and accessories" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "category/uuid.jpg" })
  @IsOptional()
  @IsString()
  imageKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
