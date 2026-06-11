import {
  Controller,
  Post,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiConsumes } from "@nestjs/swagger";
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
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, and WebP are allowed",
      );
    }

    const { imageKey, url } = await this.s3Service.uploadFile(file);

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
  async deleteFile(@Query("key") key: string) {
    if (!key) {
      throw new BadRequestException("No image key provided");
    }

    await this.s3Service.deleteFile(key);

    return {
      success: true,
      data: null,
      message: "File deleted successfully",
      errors: [],
    };
  }
}
