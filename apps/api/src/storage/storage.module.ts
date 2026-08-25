import { Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './storage.interface';
import { FirebaseStorageService } from './providers/firebase.storage';
import { S3StorageService } from './providers/s3.storage';
import { AzureStorageService } from './providers/azure.storage';
import { GcpStorageService } from './providers/gcp.storage';

/**
 * StorageModule dynamically selects the active storage provider
 * based on the STORAGE_PROVIDER environment variable.
 *
 * Supported values:
 *   firebase  →  Google Firebase Storage (default)
 *   s3        →  AWS S3 (also works with MinIO, Cloudflare R2, Backblaze B2)
 *   azure     →  Azure Blob Storage
 *   gcp       →  Google Cloud Storage
 *
 * To switch providers: change STORAGE_PROVIDER in your .env — no code changes needed.
 */
const providerMap = {
  firebase: FirebaseStorageService,
  s3: S3StorageService,
  azure: AzureStorageService,
  gcp: GcpStorageService,
} as const;

type StorageProvider = keyof typeof providerMap;

const activeProvider = (process.env.STORAGE_PROVIDER as StorageProvider) ?? 'firebase';

if (!providerMap[activeProvider]) {
  throw new Error(
    `[StorageModule] Unknown STORAGE_PROVIDER="${activeProvider}". Valid values: ${Object.keys(providerMap).join(', ')}`,
  );
}

const SelectedProvider = providerMap[activeProvider];

@Module({
  providers: [
    SelectedProvider,
    {
      provide: STORAGE_SERVICE,
      useExisting: SelectedProvider,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
