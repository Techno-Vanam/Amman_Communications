import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
]);

@Injectable()
export class StorageService implements OnModuleInit {
  private bucket?: ReturnType<typeof getStorage>;
  private isLocalFallback = false;
  private localUploadDir = path.resolve(process.cwd(), 'uploads');
  private encryptionSecret = process.env.ENCRYPTION_KEY || 'amman-communications-aes-256-key-32b!';

  onModuleInit() {
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY ||
      !process.env.FIREBASE_STORAGE_BUCKET
    ) {
      this.isLocalFallback = true;
      if (!fs.existsSync(this.localUploadDir)) {
        fs.mkdirSync(this.localUploadDir, { recursive: true });
      }
      return;
    }

    try {
      const app =
        getApps()[0] ??
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        });
      this.bucket = getStorage(app);
    } catch {
      this.isLocalFallback = true;
    }
  }

  validateFile(fileName: string, mimeType: string, fileSize: number) {
    const maxBytes = Number(process.env.MAX_UPLOAD_SIZE_MB ?? 10) * 1024 * 1024;

    if (!fileName || fileName.trim().length === 0) {
      throw new BadRequestException('File name is required');
    }

    const ext = path.extname(fileName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new BadRequestException(`File extension ${ext} is not allowed. Supported formats: PDF, JPG, PNG, WEBP`);
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new BadRequestException(`MIME type ${mimeType} is not supported`);
    }

    if (fileSize <= 0) {
      throw new BadRequestException('File cannot be empty');
    }

    if (fileSize > maxBytes) {
      throw new BadRequestException(`File size exceeds maximum limit of ${process.env.MAX_UPLOAD_SIZE_MB ?? 10}MB`);
    }
  }

  /**
   * Encrypt file buffer using AES-256-GCM
   */
  encryptBuffer(buffer: Buffer): { encrypted: Buffer; iv: string; authTag: string } {
    const key = crypto.createHash('sha256').update(this.encryptionSecret).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  /**
   * Decrypt file buffer using AES-256-GCM
   */
  decryptBuffer(encryptedBuffer: Buffer, ivHex: string, authTagHex: string): Buffer {
    const key = crypto.createHash('sha256').update(this.encryptionSecret).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  }

  /**
   * Encrypt and store file to disk
   */
  async saveEncryptedFile(storagePath: string, buffer: Buffer): Promise<{ isEncrypted: boolean; size: number }> {
    const localFilePath = path.join(this.localUploadDir, storagePath);
    const dir = path.dirname(localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const { encrypted, iv, authTag } = this.encryptBuffer(buffer);
    const header = JSON.stringify({ iv, authTag });
    const headerLength = Buffer.alloc(4);
    headerLength.writeUInt32BE(Buffer.byteLength(header), 0);

    const finalPayload = Buffer.concat([headerLength, Buffer.from(header), encrypted]);
    fs.writeFileSync(localFilePath, finalPayload);

    return { isEncrypted: true, size: finalPayload.length };
  }

  /**
   * Read and decrypt stored file
   */
  async readDecryptedFile(storagePath: string): Promise<Buffer> {
    const localFilePath = path.join(this.localUploadDir, storagePath);
    if (!fs.existsSync(localFilePath)) {
      throw new BadRequestException('Stored file not found');
    }

    const fileContent = fs.readFileSync(localFilePath);
    if (fileContent.length < 4) return fileContent;

    const headerLength = fileContent.readUInt32BE(0);
    const headerJson = fileContent.subarray(4, 4 + headerLength).toString('utf-8');
    const encryptedBody = fileContent.subarray(4 + headerLength);

    try {
      const { iv, authTag } = JSON.parse(headerJson);
      return this.decryptBuffer(encryptedBody, iv, authTag);
    } catch {
      // Return raw buffer if not encrypted
      return fileContent;
    }
  }

  async createUploadUrl(storagePath: string, contentType: string): Promise<string> {
    if (this.isLocalFallback || !this.bucket) {
      return `/api/v1/storage/local-upload?path=${encodeURIComponent(storagePath)}`;
    }
    const [url] = await this.bucket
      .bucket()
      .file(storagePath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000,
        contentType,
      });
    return url;
  }

  async createDownloadUrl(storagePath: string): Promise<string> {
    if (this.isLocalFallback || !this.bucket) {
      return `/api/v1/customer/documents/download-stream?path=${encodeURIComponent(storagePath)}`;
    }
    const [url] = await this.bucket
      .bucket()
      .file(storagePath)
      .getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000,
      });
    return url;
  }

  async deleteFile(storagePath: string): Promise<void> {
    if (this.isLocalFallback || !this.bucket) {
      const localFilePath = path.join(this.localUploadDir, storagePath);
      if (fs.existsSync(localFilePath)) {
        try {
          fs.unlinkSync(localFilePath);
        } catch {
          // ignore error if file was already removed
        }
      }
      return;
    }
    try {
      await this.bucket.bucket().file(storagePath).delete({ ignoreNotFound: true });
    } catch {
      // Ignore if file doesn't exist in remote bucket
    }
  }
}
