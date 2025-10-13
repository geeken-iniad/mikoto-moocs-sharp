import { StorageManager } from "@mikoto-moocs-sharp/shared";
import { GMStorageAdapter } from "./storageAdapter";

/**
 * Userscript用のStorageManagerインスタンス
 */
export const storageManager = new StorageManager(new GMStorageAdapter());
