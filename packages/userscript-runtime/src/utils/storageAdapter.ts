import type {
  IStorageAdapter,
  StorageUnwatchFunction,
  StorageWatchCallback,
} from "@mikoto-moocs-sharp/shared";
import {
  GM_addValueChangeListener,
  GM_deleteValue,
  GM_getValue,
  GM_removeValueChangeListener,
  GM_setValue,
} from "$";

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
      (
        _name: string,
        _oldValue: unknown,
        newValue: unknown,
        _remote?: boolean,
      ) => {
        let parsed: T | null;
        if (newValue === null || newValue === undefined) {
          parsed = null;
        } else if (typeof newValue === "string") {
          try {
            parsed = JSON.parse(newValue) as T;
          } catch {
            parsed = newValue as T;
          }
        } else {
          parsed = newValue as T;
        }
        callback(parsed);
      },
    );
    return () => GM_removeValueChangeListener(listenerId);
  }
}
