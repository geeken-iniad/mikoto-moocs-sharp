import { StorageManager } from "@mikoto-moocs-sharp/shared/storage";
import { WXTStorageAdapter } from "./storageAdapter";

// Extension全体で使用するStorageManagerインスタンス
export const storageManager = new StorageManager(new WXTStorageAdapter());
