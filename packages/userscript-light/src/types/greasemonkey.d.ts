/**
 * Greasemonkey/Tampermonkey API 型定義
 */

/**
 * ストレージから値を取得
 */
declare function GM_getValue<T = any>(key: string, defaultValue?: T): T;

/**
 * ストレージに値を設定
 */
declare function GM_setValue(key: string, value: any): void;

/**
 * ストレージから値を削除
 */
declare function GM_deleteValue(key: string): void;

/**
 * ストレージの値変更を監視
 */
declare function GM_addValueChangeListener(
  key: string,
  callback: (
    name: string,
    oldValue: any,
    newValue: any,
    remote: boolean,
  ) => void,
): number;

/**
 * ストレージの値変更監視を解除
 */
declare function GM_removeValueChangeListener(listenerId: number): void;
