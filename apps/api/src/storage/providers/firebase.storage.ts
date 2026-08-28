import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { IStorageService } from '../storage.interface';

/**
 * Firebase Storage provider.
 * Set STORAGE_PROVIDER=firebase in your .env to activate this provider.
 */
@Injectable()
export class FirebaseStorageService implements IStorageService, OnModuleInit {
  private readonly logger = new Logger(FirebaseStorageService.name);
  private bucket?: ReturnType<typeof getStorage>;

  onModuleInit() {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_STORAGE_BUCKET) {
      this.logger.warn(
        '[FirebaseStorageService] Firebase env vars not configured. Fallback to local signed URL simulation for development.',
      );
      return;
    }

    try {
      const app =
        getApps()[0] ??
        initializeApp({
          credential: cert({
            projectId: FIREBASE_PROJECT_ID,
            clientEmail: FIREBASE_CLIENT_EMAIL,
            privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          storageBucket: FIREBASE_STORAGE_BUCKET,
        });

      this.bucket = getStorage(app);
    } catch (err) {
      this.logger.warn(`Firebase initialization warning: ${(err as Error).message}. Running in local simulation mode.`);
    }
  }

  async createUploadUrl(path: string, contentType: string): Promise<string> {
    if (!this.bucket) {
      const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      return `${baseUrl}/customer/documents/mock-upload?path=${encodeURIComponent(path)}&type=${encodeURIComponent(contentType)}`;
    }

    const [url] = await this.bucket
      .bucket()
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
    if (!this.bucket) {
      const baseUrl = process.env.PUBLIC_API_URL || 'http://localhost:3003/api/v1';
      return `${baseUrl}/customer/documents/mock-download?path=${encodeURIComponent(path)}`;
    }

    const [url] = await this.bucket
      .bucket()
      .file(path)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
      });
    return url;
  }
}
