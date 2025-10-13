import React, { useCallback } from "react";

import { useElementObserver } from "../../hooks";
import { CONFIG } from "../../constants";
import { applyStyles } from "../../utils/dom";
import { containsKeywords } from "../../utils/text";

const SIDEBAR_MENU_TEXT_SELECTOR = "span.sidebar-menu-text";

type ContentType = "attendance" | "assignment";

interface ContentTypeStyle {
  color: string;
  backgroundColor: string;
}

const getContentType = (textContent: string): ContentType | null => {
  if (containsKeywords(textContent, CONFIG.WORDS.attendances)) {
    return "attendance";
  }
  if (containsKeywords(textContent, CONFIG.WORDS.assignments)) {
    return "assignment";
  }
  return null;
};

const getStyleForContentType = (type: ContentType): ContentTypeStyle => {
  return CONFIG.STYLES[type];
};

const applyContentTypeStyles = (
  span: HTMLElement,
  parentLi: HTMLElement | null,
  style: ContentTypeStyle,
): void => {
  applyStyles(span, { color: style.color });

  if (parentLi) {
    applyStyles(parentLi, { backgroundColor: style.backgroundColor });
  }
};

const processSidebarElement = (element: Element): void => {
  const span = element as HTMLElement;
  const textContent = span.textContent || "";
  const parentLi = span.closest("li") as HTMLElement | null;

  const contentType = getContentType(textContent);
  if (!contentType) {
    return;
  }

  const style = getStyleForContentType(contentType);
  applyContentTypeStyles(span, parentLi, style);
};

export const SidebarEnhancer: React.FC = () => {
  const handleSidebarElements = useCallback((elements: NodeListOf<Element>) => {
    elements.forEach(processSidebarElement);
  }, []);

  useElementObserver(SIDEBAR_MENU_TEXT_SELECTOR, handleSidebarElements);

  return null;
};
