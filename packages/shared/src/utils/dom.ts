/**
 * HTML要素にスタイルを適用
 */
export const applyStyles = (
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> | Record<string, string>,
): void => {
  console.log("[Mikoto (MOOCs #)]: Applying styles to element:", element, "styles:", styles);
  Object.assign(element.style, styles);
  console.log("[Mikoto (MOOCs #)]: Element style after applying:", element.style.cssText);
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
