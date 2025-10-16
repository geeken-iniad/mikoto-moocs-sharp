import { StorageManager } from "@mikoto-moocs-sharp/shared";
import { WXTStorageAdapter } from "./storageAdapter";

// Extension全体で使用するStorageManagerインスタンス
export const storageManager = new StorageManager(new WXTStorageAdapter());

export type { ScheduleHistory } from "@mikoto-moocs-sharp/shared";
// 後方互換性のため、旧APIもエクスポート
export { StorageManager } from "@mikoto-moocs-sharp/shared";
