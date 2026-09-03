export interface UploadOptions {
  filename: string;
  folder?: string;
  contentType?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface UploadResult {
  success: boolean;
  url: string;
  storagePath: string;
  filename: string;
  size: number;
  contentType?: string;
  provider: string;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  storagePath: string;
  error?: string;
}

/**
 * Standard Storage Service Interface for Product Images.
 * Decouples image storage (local filesystem, AWS S3, Cloudinary, GCP Storage)
 * from the database that stores product metadata.
 */
export interface IStorageService {
  readonly providerName: string;

  /**
   * Upload an image binary buffer to image storage.
   */
  upload(buffer: Buffer, options: UploadOptions): Promise<UploadResult>;

  /**
   * Delete an image from image storage using its public URL or storage path.
   */
  delete(urlOrPath: string): Promise<DeleteResult>;

  /**
   * Resolve the publicly accessible URL for a stored image.
   */
  getPublicUrl(storagePath: string): string;
}
