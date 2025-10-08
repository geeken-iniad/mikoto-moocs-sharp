import React, { useCallback } from "react";
import { CONFIG } from "../../utils";
import { containsKeywords, applyStyles } from "../../utils/utils";
import { useElementObserver } from "../../hooks";

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

  return null;
};
