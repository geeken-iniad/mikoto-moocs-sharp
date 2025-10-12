import React, { useCallback, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { useElementObserver } from "../../hooks";
import { CONFIG } from "../../constants";
import { applyStyles } from "../../utils/dom";
import { containsKeywords } from "../../utils/text";
import type { StorageManager } from "../../storage/manager";
import { createDualViewToggle } from "../ui/DualViewToggle";

const CONTENT_WRAPPER_SELECTOR = ".content-wrapper";
const CONTENT_WRAPPER_LI_SELECTOR = ".content-wrapper li";
const PAGINATION_SYMBOLS = ["«", "»"] as const;
const ACTIVE_CLASS = "active";

const getFirstChildElement = (element: Element): HTMLElement | null => {
  return element.children[0] as HTMLElement | null;
};

const isPaginationButton = (textContent: string | null): boolean => {
  return PAGINATION_SYMBOLS.includes(
    textContent as (typeof PAGINATION_SYMBOLS)[number],
  );
};

const applyActiveStyle = (element: HTMLElement): void => {
  applyStyles(element, {
    border: CONFIG.STYLES.activeBorder,
  });
};

const applyContentTypeStyle = (element: HTMLElement, title: string): void => {
  if (containsKeywords(title, CONFIG.WORDS.attendances)) {
    applyStyles(element, CONFIG.STYLES.attendance);
  } else if (containsKeywords(title, CONFIG.WORDS.assignments)) {
    applyStyles(element, CONFIG.STYLES.assignment);
  }
};

const processListItem = (li: HTMLLIElement): void => {
  const firstChild = getFirstChildElement(li);
  if (!firstChild) return;

  // アクティブな要素にスタイルを適用
  if (li.className === ACTIVE_CLASS) {
    applyActiveStyle(firstChild);
  }

  const { textContent, title } = firstChild;

  // ページネーションボタンはスキップ
  if (isPaginationButton(textContent)) return;

  // コンテンツタイプに応じたスタイルを適用
  applyContentTypeStyle(firstChild, title);
};

const findContentWrapper = (): Element | null => {
  const wrapper = document.querySelector(CONTENT_WRAPPER_SELECTOR);
  if (!wrapper) {
    console.error(
      "[Mikoto (MOOCs #)]: .content-wrapper element was not found.",
    );
  }
  return wrapper;
};

interface KeyEventData {
  key: string;
  code?: string;
  target?: EventTarget | null;
  preventDefault?: () => void;
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

const DUAL_VIEW_CLASS = "mikoto-dual-view-enabled";

export const createContentEnhancer = (storageManager: StorageManager) => {
  const DualViewToggle = createDualViewToggle(storageManager);

  const insertDualViewToggle = () => {
    const content = document.querySelector(".content");
    if (!content) return;

    // .problem-containerが存在しない場合は表示しない
    const problemContainer = content.querySelector(".problem-container");
    if (!problemContainer) return;

    const clearfix = content.querySelector(".clearfix");
    if (!clearfix) return;

    const pullRight = clearfix.querySelector(".pull-right");
    if (!pullRight) return;

    // 既存のトグルボタンを削除
    const existingToggle = pullRight.querySelector(".mikoto-dual-view-toggle");
    if (existingToggle) return;

    const container = document.createElement("span");
    pullRight.appendChild(container);

    const root = createRoot(container);
    root.render(React.createElement(DualViewToggle));
  };

  return () => {
  const handleContentItems = useCallback(() => {
    const main = findContentWrapper();
    if (!main) return;

    const listItems = Array.from(
      main.getElementsByTagName("li"),
    ) as HTMLLIElement[];
    listItems.forEach(processListItem);
  }, []);

  useElementObserver(CONTENT_WRAPPER_LI_SELECTOR, handleContentItems);

  // dual-view設定の適用
  useEffect(() => {
    const applyDualView = async () => {
      const enabled = await storageManager.getDualView();
      if (enabled) {
        document.body.classList.add(DUAL_VIEW_CLASS);
      } else {
        document.body.classList.remove(DUAL_VIEW_CLASS);
      }
    };

    applyDualView();
    insertDualViewToggle();

    // 設定変更の監視
    const unwatch = storageManager.watchDualView((enabled) => {
      if (enabled) {
        document.body.classList.add(DUAL_VIEW_CLASS);
      } else {
        document.body.classList.remove(DUAL_VIEW_CLASS);
      }
    });

    return () => {
      unwatch();
    };
  }, []);

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
          },
          "*",
        );
      } else {
        // 親フレームの場合、直接処理
        handleNumberKeyPress(e);
      }
    };

    const messageHandler = (e: MessageEvent): void => {
      if (e.data.type === "IFRAME_KEYDOWN") {
        handleNumberKeyPress(e.data);
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
};
