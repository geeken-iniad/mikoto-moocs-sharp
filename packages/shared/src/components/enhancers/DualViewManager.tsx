import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { subscribeMutation } from "../../hooks/dom/observerBus";
import { useStorageManager } from "../../storage/context";
import { DualViewToggle } from "../ui/DualViewToggle";

const DUAL_VIEW_CLASS = "mikoto-dual-view-enabled";
const DUAL_VIEW_TOGGLE_CONTAINER_CLASS = "mikoto-dual-view-toggle-container";

const ensureDualViewToggleContainer = (): HTMLSpanElement | null => {
  const content = document.querySelector(".content");
  if (!content) return null;

  const problemContainer = content.querySelector(".problem-container");
  if (!problemContainer) return null;

  const clearfix = content.querySelector(".clearfix");
  if (!clearfix) return null;

  const pullRight = clearfix.querySelector(".pull-right");
  if (!pullRight) return null;

  const existing = pullRight.querySelector<HTMLSpanElement>(
    `.${DUAL_VIEW_TOGGLE_CONTAINER_CLASS}`,
  );
  if (existing) {
    return existing;
  }

  const container = document.createElement("span");
  container.classList.add(DUAL_VIEW_TOGGLE_CONTAINER_CLASS);
  pullRight.appendChild(container);
  return container;
};

/**
 * Dual View 機能を管理するコンポーネント
 * - Dual View トグルボタンの配置
 * - Body クラスの切り替え
 * - 設定の永続化
 */
export const DualViewManager = () => {
  const storageManager = useStorageManager();
  const [toggleContainer, setToggleContainer] =
    useState<HTMLSpanElement | null>(null);

  // dual-view設定の適用
  useEffect(() => {
    let cleanupContainer: (() => void) | undefined;
    let containerRef: HTMLSpanElement | null = null;

    const applyDualView = async () => {
      const enabled = await storageManager.getDualView();
      if (enabled) {
        document.body.classList.add(DUAL_VIEW_CLASS);
      } else {
        document.body.classList.remove(DUAL_VIEW_CLASS);
      }
    };

    applyDualView();
    const attachToggle = () => {
      if (containerRef?.isConnected) {
        return;
      }

      const container = ensureDualViewToggleContainer();
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

    const unsubscribeMutation = subscribeMutation(
      document.body,
      { childList: true, subtree: true },
      () => {
        if (!containerRef?.isConnected) {
          attachToggle();
        }
      },
    );

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
      unsubscribeMutation();
      cleanupContainer?.();
      containerRef = null;
      setToggleContainer(null);
    };
  }, [storageManager]);

  if (toggleContainer) {
    return createPortal(<DualViewToggle />, toggleContainer);
  }

  return null;
};
