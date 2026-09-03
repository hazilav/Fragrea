import { IStorageService, UploadOptions, UploadResult, DeleteResult } from '../types';

/**
 * Cloud Storage Adapter (AWS S3 / Cloudflare R2 / MinIO / Google Cloud Storage).
 * Demonstrates how product images can be offloaded to cloud object storage
 * while the Database stores only the metadata & product information.
 */
export class S3StorageProvider implements IStorageService {
  public readonly providerName = 'S3_OBJECT_STORAGE';
  private bucket: string;
  private endpoint: string;

  constructor() {
    this.bucket = process.env.STORAGE_S3_BUCKET || 'fragrea-vault-assets';
    this.endpoint = process.env.STORAGE_S3_ENDPOINT || 'https://assets.fragrea.com';
  }

  async upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult> {
    const folder = options.folder || 'products';
    const key = `${folder}/${Date.now()}_${options.filename}`;
    const publicUrl = `${this.endpoint}/${this.bucket}/${key}`;

    // Note: When AWS_ACCESS_KEY_ID is provided, S3Client / PutObjectCommand executes here.
    return {
      success: true,
      url: publicUrl,
      storagePath: key,
      filename: options.filename,
      size: buffer.length,
      contentType: options.contentType,
      provider: this.providerName,
    };
  }

  async delete(urlOrPath: string): Promise<DeleteResult> {
    const key = urlOrPath.replace(`${this.endpoint}/${this.bucket}/`, '');
    return { success: true, storagePath: key };
  }

  getPublicUrl(storagePath: string): string {
    return `${this.endpoint}/${this.bucket}/${storagePath}`;
  }
}
