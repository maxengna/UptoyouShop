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
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService.get<string>("AWS_REGION") || "ap-southeast-1";
    this.bucket = this.configService.get<string>("AWS_S3_BUCKET") || "";

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
    folder = "products",
  ): Promise<{ imageKey: string; url: string }> {
    const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const imageKey = `${folder}/${randomUUID()}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return {
      imageKey,
      url: await this.getSignedUrl(imageKey), // signed URL for private bucket
    };
  }

  async deleteFile(imageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: imageKey,
      }),
    );
  }

  async getSignedUrl(imageKey: string): Promise<string> {
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: imageKey,
    });
    // URL expires in 1 hour
    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  // Retain public URL method if needed elsewhere
  getPublicUrl(imageKey: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${imageKey}`;
  }
}
