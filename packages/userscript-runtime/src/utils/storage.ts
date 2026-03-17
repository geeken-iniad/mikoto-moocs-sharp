import { StorageManager } from "@mikoto-moocs-sharp/shared";
import { GMStorageAdapter } from "./storageAdapter";

/**
 * Create a StorageManager instance
 */
export function createStorageManager(): StorageManager {
  return new StorageManager(new GMStorageAdapter());
}
