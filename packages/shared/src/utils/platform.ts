/**
 * プラットフォーム検出とキーボードショートカット関連のユーティリティ
 */

/**
 * macOS系のプラットフォームかどうかを判定
 * @returns macOS、iPhone、iPad、iPodの場合true
 */
export const isMacPlatform = (): boolean => {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

/**
 * Ctrl/Cmd+Enterのショートカットラベルを取得
 * @returns OS別のショートカットラベル
 */
export const getSubmitShortcutLabel = (): string => {
  const isMac = isMacPlatform();

  if (isMac) {
    return "⌘(Command)+Enter でフォーム提出";
  }

  return "Ctrl+Enter でフォーム提出";
};
