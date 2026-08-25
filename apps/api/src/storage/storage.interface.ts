/**
 * Token used to inject the active storage provider via NestJS DI.
 * Use @Inject(STORAGE_SERVICE) in any class that needs storage.
 */
export const STORAGE_SERVICE = 'STORAGE_SERVICE';

/**
 * Common interface that every storage provider must implement.
 * Switching providers (Firebase → S3 → Azure → GCP) requires ONLY
 * changing the STORAGE_PROVIDER environment variable — no code changes.
 */
export interface IStorageService {
  /**
   * Generate a short-lived signed URL that allows the client to upload
   * a file directly to the storage bucket (PUT request).
   * @param path     - Destination path inside the bucket (e.g. documents/user123/file.pdf)
   * @param contentType - MIME type of the file being uploaded
   * @returns Signed upload URL valid for ~15 minutes
   */
  createUploadUrl(path: string, contentType: string): Promise<string>;

  /**
   * Generate a short-lived signed URL that allows the client to download
   * a file directly from the storage bucket (GET request).
   * @param path - Path of the file inside the bucket
   * @returns Signed download URL valid for ~15 minutes
   */
  createDownloadUrl(path: string): Promise<string>;
}
