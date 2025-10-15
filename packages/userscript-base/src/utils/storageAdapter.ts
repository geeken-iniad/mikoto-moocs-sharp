import type {
  IStorageAdapter,
  StorageUnwatchFunction,
  StorageWatchCallback,
} from "@mikoto-moocs-sharp/shared";

/**
 * GM API functions interface
 */
export interface GMApi {
  GM_getValue: (key: string, defaultValue: any) => any;
  GM_setValue: (key: string, value: any) => void;
  GM_deleteValue: (key: string) => void;
  GM_addValueChangeListener: (
    key: string,
    callback: (name: string, oldValue: any, newValue: any, remote: boolean) => void,
  ) => number;
  GM_removeValueChangeListener: (listenerId: number) => void;
}

/**
 * Greasemonkey/Tampermonkey Storage APIアダプター
 * GM APIを抽象化インターフェースに適合させる
 */
export class GMStorageAdapter implements IStorageAdapter {
  constructor(private gmApi: GMApi) {}

  async getItem<T>(key: string): Promise<T | null> {
    const value = this.gmApi.GM_getValue(key, null);
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.gmApi.GM_setValue(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    this.gmApi.GM_deleteValue(key);
  }

  watch<T>(
    key: string,
    callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction {
    const listenerId = this.gmApi.GM_addValueChangeListener(
      key,
      (_name: string, _oldValue: any, newValue: any, _remote: boolean) => {
        const parsed = newValue ? JSON.parse(newValue) : null;
        callback(parsed);
      },
    );
    return () => this.gmApi.GM_removeValueChangeListener(listenerId);
  }
}
