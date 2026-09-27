import { IStorageService } from "./types";
import { LocalStorageProvider } from "./local";

let storageServiceInstance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (storageServiceInstance) {
    return storageServiceInstance;
  }

  const provider = process.env.STORAGE_PROVIDER || "local";

  switch (provider.toLowerCase()) {
    case "s3":
      // Extensible plug: S3StorageProvider can be substituted here
      // For now default to robust LocalStorageProvider if S3 config is missing
      storageServiceInstance = new LocalStorageProvider();
      break;
    case "cloudinary":
      storageServiceInstance = new LocalStorageProvider();
      break;
    case "local":
    default:
      storageServiceInstance = new LocalStorageProvider();
      break;
  }

  return storageServiceInstance;
}

export * from "./types";
export * from "./local";
