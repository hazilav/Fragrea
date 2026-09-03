import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { IStorageService, UploadOptions, UploadResult, DeleteResult } from '../types';

export class LocalStorageProvider implements IStorageService {
  public readonly providerName = 'LOCAL_FILESYSTEM';
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'public', 'uploads');
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    try {
      const folder = options.folder || 'products';
      const targetDir = path.join(this.baseDir, folder);

      if (!existsSync(targetDir)) {
        await mkdir(targetDir, { recursive: true });
      }

      // Sanitize filename to alphanumeric, dots, hyphens, underscores
      const ext = path.extname(options.filename) || '.jpg';
      const baseName = path
        .basename(options.filename, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFilename = `${Date.now()}_${baseName}${ext}`;

      const filePath = path.join(targetDir, uniqueFilename);
      await writeFile(filePath, buffer);

      const relativeStoragePath = `/uploads/${folder}/${uniqueFilename}`;

      return {
        success: true,
        url: relativeStoragePath,
        storagePath: relativeStoragePath,
        filename: uniqueFilename,
        size: buffer.length,
        contentType: options.contentType,
        provider: this.providerName,
      };
    } catch (err: any) {
      console.error('LocalStorage upload error:', err);
      return {
        success: false,
        url: '',
        storagePath: '',
        filename: options.filename,
        size: buffer.length,
        provider: this.providerName,
        error: err.message,
      };
    }
  }

  async delete(urlOrPath: string): Promise<DeleteResult> {
    try {
      if (!urlOrPath) {
        return { success: false, storagePath: '', error: 'Path is required' };
      }

      // Strip leading /uploads/ if present
      const cleanRelative = urlOrPath.replace(/^\/?uploads\//, '');
      const fullPath = path.join(this.baseDir, cleanRelative);

      // Security check: prevent escaping baseDir
      if (!fullPath.startsWith(this.baseDir)) {
        return { success: false, storagePath: urlOrPath, error: 'Illegal file path' };
      }

      if (existsSync(fullPath)) {
        await unlink(fullPath);
      }

      return { success: true, storagePath: urlOrPath };
    } catch (err: any) {
      console.error('LocalStorage delete error:', err);
      return { success: false, storagePath: urlOrPath, error: err.message };
    }
  }

  getPublicUrl(storagePath: string): string {
    return storagePath.startsWith('/') ? storagePath : `/${storagePath}`;
  }
}
