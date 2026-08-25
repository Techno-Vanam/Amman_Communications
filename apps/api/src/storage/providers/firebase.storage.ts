import { Injectable, OnModuleInit } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { IStorageService } from '../storage.interface';

/**
 * Firebase Storage provider.
 * Set STORAGE_PROVIDER=firebase in your .env to activate this provider.
 *
 * Required env vars:
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 *   FIREBASE_STORAGE_BUCKET
 */
@Injectable()
export class FirebaseStorageService implements IStorageService, OnModuleInit {
  private bucket?: ReturnType<typeof getStorage>;

  onModuleInit() {
    const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET } = process.env;

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY || !FIREBASE_STORAGE_BUCKET) {
      throw new Error(
        '[FirebaseStorageService] Missing required env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_STORAGE_BUCKET',
      );
    }

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
  }

  async createUploadUrl(path: string, contentType: string): Promise<string> {
    if (!this.bucket) throw new Error('[FirebaseStorageService] Storage not initialized');
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
    if (!this.bucket) throw new Error('[FirebaseStorageService] Storage not initialized');
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
