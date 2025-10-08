import React, { useCallback, useEffect } from "react";

import { useElementObserver } from "../../hooks";
import { CONFIG, applyStyles, containsKeywords } from "../../utils";

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

export const ContentEnhancer: React.FC = () => {
  const handleContentItems = useCallback(() => {
    const main = findContentWrapper();
    if (!main) return;

    const listItems = Array.from(
      main.getElementsByTagName("li"),
    ) as HTMLLIElement[];
    listItems.forEach(processListItem);
  }, []);

  useElementObserver(CONTENT_WRAPPER_LI_SELECTOR, handleContentItems);

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent): void => {
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
