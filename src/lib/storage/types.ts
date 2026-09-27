export interface UploadResult {
  fileName: string;
  originalName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface IStorageService {
  uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subfolder?: string
  ): Promise<UploadResult>;

  getFileBuffer(filePath: string): Promise<Buffer>;

  deleteFile(filePath: string): Promise<boolean>;

  getFileUrl(filePath: string): string;
}
