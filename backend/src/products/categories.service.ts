import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { S3Service } from "../upload/s3.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

const DEFAULT_CATEGORIES = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Books",
  "Toys",
  "Beauty",
  "Health",
  "Food",
  "Other",
];

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  private async mapCategoryImages<T extends { imageKey?: string | null }>(category: T): Promise<T & { imageUrl?: string }> {
    if (!category.imageKey) return category;
    return {
      ...category,
      imageUrl: await this.s3Service.getSignedUrl(category.imageKey, "categories"),
    };
  }

  async getAll(page?: number, limit?: number) {
    let dbCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    if (dbCategories.length === 0) {
      const seedData = DEFAULT_CATEGORIES.map((name) => ({
        name,
        slug: name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));

      await this.prisma.category.createMany({
        data: seedData,
        skipDuplicates: true,
      });

      dbCategories = await this.prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
    }

    const total = dbCategories.length;
    let result = dbCategories;

    if (page && limit) {
      const skip = (page - 1) * limit;
      result = dbCategories.slice(skip, skip + limit);
    }

    const mapped = await Promise.all(
      result.map((cat) => this.mapCategoryImages(cat)),
    );

    const response: any = {
      success: true,
      data: { categories: mapped },
      categories: mapped,
      message: "Categories retrieved successfully",
      errors: [],
    };

    if (page && limit) {
      response.data.pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      };
    }

    return response;
  }

  async getById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return {
      success: true,
      data: await this.mapCategoryImages(category),
      message: "Category retrieved successfully",
      errors: [],
    };
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, slug } = createCategoryDto;

    const existingName = await this.prisma.category.findUnique({
      where: { name },
    });
    if (existingName) {
      throw new ConflictException("Category with this name already exists");
    }

    const existingSlug = await this.prisma.category.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException("Category with this slug already exists");
    }

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return {
      success: true,
      data: await this.mapCategoryImages(category),
      message: "Category created successfully",
      errors: [],
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Category not found");
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== existing.name) {
      const nameExists = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name },
      });
      if (nameExists) {
        throw new ConflictException("Category with this name already exists");
      }
    }

    if (updateCategoryDto.slug && updateCategoryDto.slug !== existing.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug: updateCategoryDto.slug },
      });
      if (slugExists) {
        throw new ConflictException("Category with this slug already exists");
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });

    return {
      success: true,
      data: await this.mapCategoryImages(category),
      message: "Category updated successfully",
      errors: [],
    };
  }

  async delete(id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!existing) {
      throw new NotFoundException("Category not found");
    }

    if (existing._count.products > 0) {
      throw new BadRequestException(
        `Cannot delete category "${existing.name}" because it has ${existing._count.products} product(s) associated with it. Reassign products first.`,
      );
    }

    if (existing.imageKey) {
      await this.s3Service.deleteFile(existing.imageKey, "categories").catch(() => {});
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      success: true,
      data: null,
      message: "Category deleted successfully",
      errors: [],
    };
  }
}
