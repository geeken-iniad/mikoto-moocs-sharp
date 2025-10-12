import type {
  IStorageAdapter,
  StorageWatchCallback,
  StorageUnwatchFunction,
} from "@mikoto-moocs-sharp/shared";

/**
 * Greasemonkey/Tampermonkey Storage APIアダプター
 * GM APIを抽象化インターフェースに適合させる
 */
export class GMStorageAdapter implements IStorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    const value = GM_getValue(key, null);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    GM_setValue(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    GM_deleteValue(key);
  }

  watch<T>(
    key: string,
    callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction {
    const listenerId = GM_addValueChangeListener(
      key,
      (_name: string, _oldValue: any, newValue: any, _remote: boolean) => {
        const parsed = newValue ? JSON.parse(newValue) : null;
        callback(parsed);
      },
    );
    return () => GM_removeValueChangeListener(listenerId);
  }
}
