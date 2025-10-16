/**
 * ストレージ抽象化インターフェース
 * ブラウザ拡張機能やユーザースクリプトで共通のストレージAPIを提供
 */

/**
 * ストレージの変更を監視するコールバック関数の型
 */
export type StorageWatchCallback<T> = (newValue: T | null) => void;

/**
 * ストレージ監視を解除する関数の型
 */
export type StorageUnwatchFunction = () => void;

/**
 * ストレージ操作の基本インターフェース
 */
export interface IStorageAdapter {
  /**
   * 値を取得
   */
  getItem<T>(key: string): Promise<T | null>;

  /**
   * 値を保存
   */
  setItem<T>(key: string, value: T): Promise<void>;

  /**
   * 値を削除
   */
  removeItem(key: string): Promise<void>;

  /**
   * 値の変更を監視
   */
  watch<T>(
    key: string,
    callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction;
}
