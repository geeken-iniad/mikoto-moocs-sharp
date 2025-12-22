import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { SlideEnhancerToggle } from "../ui/SlideEnhancerToggle";

const SLIDE_TOGGLE_CONTAINER_CLASS = "mikoto-slide-enhancer-toggle-container";

const ensureSlideToggleContainer = (): HTMLSpanElement | null => {
  const root = document.querySelector(".content") ?? document.body;
  const bookmarkToggle = root.querySelector("#bookmark-toggle");
  const pullRightFromBookmark = bookmarkToggle?.closest(".pull-right");
  const pullRight =
    pullRightFromBookmark ?? root.querySelector(".clearfix .pull-right");
  if (!pullRight) return null;

  const existing = pullRight.querySelector<HTMLSpanElement>(
    `.${SLIDE_TOGGLE_CONTAINER_CLASS}`,
  );
  if (existing) {
    return existing;
  }

  const container = document.createElement("span");
  container.classList.add(SLIDE_TOGGLE_CONTAINER_CLASS);
  pullRight.appendChild(container);
  return container;
};

/**
 * Slide Enhancer トグルボタンを配置するコンポーネント
 */
export const SlideEnhancerManager = () => {
  const [toggleContainer, setToggleContainer] =
    useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    let cleanupContainer: (() => void) | undefined;
    let containerRef: HTMLSpanElement | null = null;

    const attachToggle = () => {
      if (containerRef?.isConnected) {
        return;
      }

      const container = ensureSlideToggleContainer();
      if (!container) {
        return;
      }

      containerRef = container;
      setToggleContainer(container);
      cleanupContainer = () => {
        if (container.isConnected) {
          container.remove();
        }
      };
    };

    attachToggle();

    const observer = new MutationObserver(() => {
      if (containerRef?.isConnected) {
        return;
      }
      attachToggle();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanupContainer?.();
      containerRef = null;
      setToggleContainer(null);
    };
  }, []);

  if (toggleContainer) {
    return createPortal(<SlideEnhancerToggle />, toggleContainer);
  }

  return null;
};
