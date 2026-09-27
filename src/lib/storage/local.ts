import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { IStorageService, UploadResult } from "./types";

export class LocalStorageProvider implements IStorageService {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  }

  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    subfolder = "assessments"
  ): Promise<UploadResult> {
    const targetFolder = path.join(this.baseDir, subfolder);
    await this.ensureDir(targetFolder);

    const ext = path.extname(originalName) || ".pdf";
    const randomHash = crypto.randomBytes(12).toString("hex");
    const sanitizedOriginal = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${Date.now()}_${sanitizedOriginal}_${randomHash}${ext}`;
    const fullPath = path.join(targetFolder, uniqueFileName);

    await fs.writeFile(fullPath, fileBuffer);

    const relativePath = path.join(subfolder, uniqueFileName).replace(/\\/g, "/");
    const url = `/api/assessments/download?path=${encodeURIComponent(relativePath)}`;

    return {
      fileName: uniqueFileName,
      originalName,
      path: relativePath,
      url,
      mimeType,
      size: fileBuffer.length,
    };
  }

  async getFileBuffer(filePath: string): Promise<Buffer> {
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "");
    const fullPath = path.join(this.baseDir, safePath);
    return await fs.readFile(fullPath);
  }

  async deleteFile(filePath: string): Promise<boolean> {
    try {
      const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(this.baseDir, safePath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  getFileUrl(filePath: string): string {
    const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, "").replace(/\\/g, "/");
    return `/api/assessments/download?path=${encodeURIComponent(safePath)}`;
  }
}
