import { Injectable, OnModuleInit } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

@Injectable()
export class StorageService implements OnModuleInit {
  private bucket?: ReturnType<typeof getStorage>;
  onModuleInit() {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_STORAGE_BUCKET) return;
    const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') }), storageBucket: process.env.FIREBASE_STORAGE_BUCKET });
    this.bucket = getStorage(app);
  }
  async createUploadUrl(path: string, contentType: string) {
    if (!this.bucket) throw new Error('Firebase Storage is not configured');
    const [url] = await this.bucket.bucket().file(path).getSignedUrl({ version: 'v4', action: 'write', expires: Date.now() + 15 * 60 * 1000, contentType });
    return url;
  }
  async createDownloadUrl(path: string) {
    if (!this.bucket) throw new Error('Firebase Storage is not configured');
    const [url] = await this.bucket.bucket().file(path).getSignedUrl({ version: 'v4', action: 'read', expires: Date.now() + 15 * 60 * 1000 });
    return url;
  }
}
