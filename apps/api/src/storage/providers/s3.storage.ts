import { Injectable, OnModuleInit } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageService } from '../storage.interface';

/**
 * AWS S3 Storage provider.
 * Set STORAGE_PROVIDER=s3 in your .env to activate this provider.
 *
 * Required env vars:
 *   AWS_REGION              (e.g. ap-south-1)
 *   AWS_ACCESS_KEY_ID
 *   AWS_SECRET_ACCESS_KEY
 *   AWS_S3_BUCKET           (bucket name)
 *
 * Works with any S3-compatible storage (MinIO, Cloudflare R2, Backblaze B2)
 * by additionally setting: AWS_S3_ENDPOINT (e.g. https://your-minio-host:9000)
 */
@Injectable()
export class S3StorageService implements IStorageService, OnModuleInit {
  private client!: S3Client;
  private bucket!: string;

  onModuleInit() {
    const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_S3_ENDPOINT } = process.env;

    if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
      throw new Error(
        '[S3StorageService] Missing required env vars: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET',
      );
    }

    this.bucket = AWS_S3_BUCKET;
    this.client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      // Optional: for S3-compatible providers (MinIO, R2, Backblaze)
      ...(AWS_S3_ENDPOINT ? { endpoint: AWS_S3_ENDPOINT, forcePathStyle: true } : {}),
    });
  }

  async createUploadUrl(path: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: path,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn: 15 * 60 });
  }

  async createDownloadUrl(path: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: path,
    });
    return getSignedUrl(this.client, command, { expiresIn: 15 * 60 });
  }
}
