import { IStorageService } from './types';
import { LocalStorageProvider } from './providers/LocalStorageProvider';
import { S3StorageProvider } from './providers/S3StorageProvider';

const localInstance = new LocalStorageProvider();
let s3Instance: S3StorageProvider | null = null;

/**
 * Storage Service Factory.
 * Central resolver for image storage operations.
 * Decouples image binary handling from SQLite database product records.
 */
export function getStorageService(providerName?: string): IStorageService {
  const selectedProvider = (
    providerName ||
    process.env.IMAGE_STORAGE_PROVIDER ||
    'LOCAL'
  ).toUpperCase();

  switch (selectedProvider) {
    case 'S3':
    case 'CLOUD':
      if (!s3Instance) {
        s3Instance = new S3StorageProvider();
      }
      return s3Instance;

    case 'LOCAL':
    default:
      return localInstance;
  }
}
