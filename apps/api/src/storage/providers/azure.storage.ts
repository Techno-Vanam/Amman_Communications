import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { IStorageService } from '../storage.interface';

/**
 * Azure Blob Storage provider.
 * Set STORAGE_PROVIDER=azure in your .env to activate this provider.
 *
 * Required env vars:
 *   AZURE_STORAGE_ACCOUNT     (storage account name)
 *   AZURE_STORAGE_KEY         (storage account access key)
 *   AZURE_STORAGE_CONTAINER   (container name, e.g. documents)
 */
@Injectable()
export class AzureStorageService implements IStorageService, OnModuleInit {
  private client!: BlobServiceClient;
  private credential!: StorageSharedKeyCredential;
  private container!: string;
  private account!: string;

  onModuleInit() {
    const { AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_KEY, AZURE_STORAGE_CONTAINER } = process.env;

    if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_KEY || !AZURE_STORAGE_CONTAINER) {
      throw new Error(
        '[AzureStorageService] Missing required env vars: AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_KEY, AZURE_STORAGE_CONTAINER',
      );
    }

    this.account = AZURE_STORAGE_ACCOUNT;
    this.container = AZURE_STORAGE_CONTAINER;
    this.credential = new StorageSharedKeyCredential(AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_KEY);
    this.client = new BlobServiceClient(
      `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net`,
      this.credential,
    );
  }

  async createUploadUrl(path: string, _contentType: string): Promise<string> {
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.container,
        blobName: path,
        permissions: BlobSASPermissions.parse('w'), // write only
        expiresOn,
      },
      this.credential,
    ).toString();

    return `https://${this.account}.blob.core.windows.net/${this.container}/${path}?${sasToken}`;
  }

  async createDownloadUrl(path: string): Promise<string> {
    const expiresOn = new Date(Date.now() + 15 * 60 * 1000);
    const sasToken = generateBlobSASQueryParameters(
      {
        containerName: this.container,
        blobName: path,
        permissions: BlobSASPermissions.parse('r'), // read only
        expiresOn,
      },
      this.credential,
    ).toString();

    return `https://${this.account}.blob.core.windows.net/${this.container}/${path}?${sasToken}`;
  }
}
