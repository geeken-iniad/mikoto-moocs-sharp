/**
 * HTML要素にスタイルを適用
 */
export const applyStyles = (
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> | Record<string, string>,
): void => {
  Object.assign(element.style, styles);
};

/**
 * MOOCsページかどうかを判定
 */
export function isMoocsPage(): boolean {
  return window.location.hostname === "moocs.iniad.org";
}

/**
 * ログ出力ユーティリティ
 */
export function log(message: string, ...args: unknown[]): void {
  console.log(`[Mikoto MOOCs #] ${message}`, ...args);
}
