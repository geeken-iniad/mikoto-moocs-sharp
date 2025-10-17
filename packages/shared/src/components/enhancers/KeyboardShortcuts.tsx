import { useEffect } from "react";

interface KeyEventData {
  key: string;
  code?: string;
  target?: EventTarget | null;
  preventDefault?: () => void;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

const isInputElement = (target: HTMLElement): boolean => {
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

const handleSubmitShortcut = (e: KeyEventData): void => {
  // Enterキーのチェック
  if (e.key !== "Enter") return;

  // Mac, iPhone, iPad, iPodではCmd+Enter、それ以外ではCtrl+Enterのみ
  const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const keyEvent = e as KeyboardEvent;
  const hasCorrectModifier = isMac ? keyEvent.metaKey : keyEvent.ctrlKey;
  const hasWrongModifier = isMac ? keyEvent.ctrlKey : keyEvent.metaKey;

  if (!hasCorrectModifier || hasWrongModifier) return;

  // 入力要素にフォーカスがある場合のみ処理
  if (!e.target) return;
  const target = e.target as HTMLElement;
  if (!isInputElement(target)) return;

  // problem-container内の要素かチェック
  const problemContainer = target.closest(".problem-container");
  if (!problemContainer) return;

  // 同じproblem-container内のsubmit-answerボタンを探す
  const submitButton = problemContainer.querySelector(
    "button.submit-answer",
  ) as HTMLButtonElement;
  if (submitButton) {
    e.preventDefault?.();
    submitButton.click();
  }
};

const handleNumberKeyPress = (e: KeyEventData): void => {
  // 修飾キーが押されている場合は何もしない
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
    return;
  }

  // 入力要素にフォーカスがある場合は何もしない
  if (e.target) {
    const target = e.target as HTMLElement;
    if (isInputElement(target)) {
      return;
    }
  }

  // 数字キー（1-9）の場合のみ処理
  const key = e.key;
  if (!/^[1-9]$/.test(key)) return;

  // ページネーション内のリンクを探す
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  const links = Array.from(
    pagination.querySelectorAll("li a"),
  ) as HTMLAnchorElement[];
  const targetLink = links.find((link) => link.textContent?.trim() === key);

  if (targetLink) {
    e.preventDefault?.();
    targetLink.click();
  }
};

const handleArrowKeyPress = (e: KeyEventData): void => {
  // Shiftキーのみが押されている必要がある (他の修飾キーは不可)
  if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) {
    return;
  }

  // 入力要素にフォーカスがある場合は何もしない
  if (e.target) {
    const target = e.target as HTMLElement;
    if (isInputElement(target)) {
      return;
    }
  }

  // 矢印キーの判定
  const key = e.key;
  let targetSymbol: string;
  if (key === "ArrowLeft") {
    targetSymbol = "«"; // 前へ
  } else if (key === "ArrowRight") {
    targetSymbol = "»"; // 次へ
  } else {
    return;
  }

  // ページネーション内のリンクを探す
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;

  const links = Array.from(
    pagination.querySelectorAll("li a"),
  ) as HTMLAnchorElement[];
  const targetLink = links.find(
    (link) => link.textContent?.trim() === targetSymbol,
  );

  if (targetLink) {
    e.preventDefault?.();
    targetLink.click();
  }
};

/**
 * キーボードショートカット機能を提供するコンポーネント
 * - Ctrl/Cmd + Enter: フォーム提出
 * - 数字キー (1-9): ページネーション
 * - Shift + ←/→: 前のページ/次のページ
 */
export const KeyboardShortcuts = () => {
  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent): void => {
      // Ctrl/Cmd+Enterのショートカットを処理
      handleSubmitShortcut(e);

      if (window !== window.top) {
        // iframeの場合、親フレームにメッセージを送信
        window.top?.postMessage(
          {
            type: "IFRAME_KEYDOWN",
            key: e.key,
            code: e.code,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey,
          },
          "*",
        );
      } else {
        // 親フレームの場合、直接処理
        handleNumberKeyPress(e);
        handleArrowKeyPress(e);
      }
    };

    const messageHandler = (e: MessageEvent): void => {
      if (e.data.type === "IFRAME_KEYDOWN") {
        handleNumberKeyPress(e.data);
        handleArrowKeyPress(e.data);
      }
    };

    // キーダウンイベントをキャプチャフェーズで捕捉
    window.addEventListener("keydown", keydownHandler, true);

    // 親フレームの場合、メッセージを受信
    if (window === window.top) {
      window.addEventListener("message", messageHandler);
    }

    return () => {
      window.removeEventListener("keydown", keydownHandler, true);
      if (window === window.top) {
        window.removeEventListener("message", messageHandler);
      }
    };
  }, []);

  return null;
};
