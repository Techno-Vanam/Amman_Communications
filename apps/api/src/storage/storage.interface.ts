export interface IStorageService {
  createUploadUrl(path: string, contentType: string): Promise<string>;
  createDownloadUrl(path: string): Promise<string>;
}
