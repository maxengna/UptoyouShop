import { Controller, Get } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Controller("categories")
export class CategoriesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getCategories() {
    let dbCategories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    // If database categories list is empty, seed defaults into database
    if (dbCategories.length === 0) {
      const defaultCategories = [
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

      const seedData = defaultCategories.map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
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

    return {
      success: true,
      data: {
        categories: dbCategories,
      },
      categories: dbCategories,
      message: "Categories retrieved successfully",
      errors: [],
    };
  }
}
