import { useCallback } from "react";

import { CONFIG } from "../../constants";
import { useElementObserver } from "../../hooks";
import { applyStyles } from "../../utils/dom";
import { containsKeywords } from "../../utils/text";

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
  if (!firstChild) {
    return;
  }

  // アクティブな要素にスタイルを適用
  if (li.className === ACTIVE_CLASS) {
    applyActiveStyle(li);
  }

  const { textContent, title } = firstChild;

  // ページネーションボタンはスキップ
  if (isPaginationButton(textContent)) {
    return;
  }

  // コンテンツタイプに応じたスタイルを適用
  applyContentTypeStyle(firstChild, title);
};

/**
 * コンテンツのスタイルを強化するコンポーネント
 * - タブの色付け（出席・課題）
 * - アクティブな要素の強調
 */
export const ContentStyleEnhancer = () => {
  const handleContentItems = useCallback((elements: NodeListOf<Element>) => {
    const listItems = Array.from(elements) as HTMLLIElement[];
    listItems.forEach(processListItem);
  }, []);

  useElementObserver(CONTENT_WRAPPER_LI_SELECTOR, handleContentItems);

  return null;
};
