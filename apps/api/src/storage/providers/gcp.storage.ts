import { Injectable, OnModuleInit } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { IStorageService } from '../storage.interface';

/**
 * Google Cloud Storage provider.
 * Set STORAGE_PROVIDER=gcp in your .env to activate this provider.
 *
 * Required env vars:
 *   GCP_PROJECT_ID
 *   GCP_CLIENT_EMAIL
 *   GCP_PRIVATE_KEY
 *   GCP_STORAGE_BUCKET   (bucket name)
 */
@Injectable()
export class GcpStorageService implements IStorageService, OnModuleInit {
  private storage!: Storage;
  private bucket!: string;

  onModuleInit() {
    const { GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY, GCP_STORAGE_BUCKET } = process.env;

    if (!GCP_PROJECT_ID || !GCP_CLIENT_EMAIL || !GCP_PRIVATE_KEY || !GCP_STORAGE_BUCKET) {
      throw new Error(
        '[GcpStorageService] Missing required env vars: GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY, GCP_STORAGE_BUCKET',
      );
    }

    this.bucket = GCP_STORAGE_BUCKET;
    this.storage = new Storage({
      projectId: GCP_PROJECT_ID,
      credentials: {
        client_email: GCP_CLIENT_EMAIL,
        private_key: GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  }

  async createUploadUrl(path: string, contentType: string): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(path)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType,
      });
    return url;
  }

  async createDownloadUrl(path: string): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucket)
      .file(path)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
      });
    return url;
  }
}
