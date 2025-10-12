import type {
  IStorageAdapter,
  StorageWatchCallback,
  StorageUnwatchFunction,
} from "@mikoto-moocs-sharp/shared";

/**
 * WXT Storage APIアダプター
 * WXTのstorage APIを抽象化インターフェースに適合させる
 */
export class WXTStorageAdapter implements IStorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    return await storage.getItem<T>(`local:${key}`);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await storage.setItem(`local:${key}`, value);
  }

  async removeItem(key: string): Promise<void> {
    await storage.removeItem(`local:${key}`);
  }

  watch<T>(
    key: string,
    callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction {
    return storage.watch<T>(`local:${key}`, callback);
  }
}
