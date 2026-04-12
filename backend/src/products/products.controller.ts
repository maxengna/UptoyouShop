import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductQueryDto } from "./dto/product-query.dto";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: "Get all products with pagination and filters" })
  async getProducts(@Query() query: ProductQueryDto) {
    return this.productsService.getProducts(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  async getProductById(@Param("id") id: string) {
    return this.productsService.getProductById(id);
  }

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create product (Admin only)" })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(createProductDto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update product (Admin only)" })
  async updateProduct(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete product (Admin only)" })
  async deleteProduct(@Param("id") id: string) {
    return this.productsService.deleteProduct(id);
  }

  @Get(":id/reviews")
  @ApiOperation({ summary: "Get product reviews" })
  async getProductReviews(
    @Param("id") id: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.productsService.getProductReviews(id, page, limit);
  }
}
