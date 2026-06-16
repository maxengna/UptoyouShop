import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes, ApiQuery } from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { S3Service } from "./s3.service";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post()
  @ApiOperation({ summary: "Upload image to S3" })
  @ApiConsumes("multipart/form-data")
  @ApiQuery({ name: "folder", required: false, description: "Folder prefix (e.g. products, category)" })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query("folder") folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      );
    }

    const options: { folder?: string; bucket?: "products" | "categories" } = {};
    if (folder === "category") {
      options.folder = "category";
      options.bucket = "categories";
    }

    const { imageKey, url } = await this.s3Service.uploadFile(file, options);

    return {
      success: true,
      data: {
        imageKey,
        url,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
      message: "File uploaded successfully",
      errors: [],
    };
  }

  @Delete()
  @ApiOperation({ summary: "Delete image from S3" })
  @ApiQuery({ name: "key", required: true, description: "Image key to delete" })
  @ApiQuery({ name: "bucket", required: false, description: "Bucket type (products, categories)" })
  async deleteFile(
    @Query("key") key: string,
    @Query("bucket") bucket?: "products" | "categories",
  ) {
    if (!key) {
      throw new BadRequestException("No image key provided");
    }

    await this.s3Service.deleteFile(key, bucket);

    return {
      success: true,
      data: null,
      message: "File deleted successfully",
      errors: [],
    };
  }
}
