import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  private readonly productBucket: string;
  private readonly categoryBucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>("AWS_REGION") || "ap-southeast-1";
    this.productBucket = this.configService.get<string>("AWS_S3_PRODUCTS_BUCKET") || "";
    this.categoryBucket = this.configService.get<string>("AWS_S3_CATEGORIES_BUCKET") || this.productBucket;

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID") || "",
        secretAccessKey:
          this.configService.get<string>("AWS_SECRET_ACCESS_KEY") || "",
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    options?: { folder?: string; bucket?: "products" | "categories" },
  ): Promise<{ imageKey: string; url: string }> {
    const folder = options?.folder || "products";
    const bucketType = options?.bucket || "products";
    const bucket = bucketType === "categories" ? this.categoryBucket : this.productBucket;
    const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const imageKey = `${folder}/${randomUUID()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      imageKey,
      url: await this.getSignedUrl(imageKey, bucket),
    };
  }

  async deleteFile(imageKey: string, bucket?: "products" | "categories"): Promise<void> {
    const targetBucket = bucket === "categories" ? this.categoryBucket : this.productBucket;

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: targetBucket,
        Key: imageKey,
      }),
    );
  }

  async getSignedUrl(imageKey: string, bucketOrType?: string | "products" | "categories"): Promise<string> {
    const bucket = !bucketOrType || bucketOrType === "products"
      ? this.productBucket
      : bucketOrType === "categories"
        ? this.categoryBucket
        : bucketOrType;
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: imageKey,
    });
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  getPublicUrl(imageKey: string, bucketType?: "products" | "categories"): string {
    const bucket = bucketType === "categories" ? this.categoryBucket : this.productBucket;
    return `https://${bucket}.s3.${this.region}.amazonaws.com/${imageKey}`;
  }
}
