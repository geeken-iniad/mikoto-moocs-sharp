import { StorageManager } from "@mikoto-moocs-sharp/shared";
import type { GMApi } from "./storageAdapter";
import { GMStorageAdapter } from "./storageAdapter";

/**
 * Create a StorageManager instance with provided GM API
 */
export function createStorageManager(gmApi: GMApi): StorageManager {
  return new StorageManager(new GMStorageAdapter(gmApi));
}
