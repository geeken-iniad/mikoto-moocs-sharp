import React, { useEffect } from "react";

interface ExtendedHTMLElement extends HTMLElement {
  __mikotoCleanup?: boolean;
  __mikotoHandler?: (e: Event) => void;
}

const setupWellClickHandler = (well: HTMLElement): void => {
  const handleClick = (e: Event): void => {
    // リンク自体がクリックされた場合は何もしない
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.closest("a")) {
      return;
    }

    // well内のリンクを探してクリック
    const link = well.querySelector("a.btn-primary") as HTMLAnchorElement;
    if (link) {
      link.click();
    } else {
    }
  };

  // 既存のハンドラを削除してから新しいハンドラを追加
  const extendedWell = well as ExtendedHTMLElement;
  if (extendedWell.__mikotoHandler) {
    well.removeEventListener("click", extendedWell.__mikotoHandler);
  }

  well.addEventListener("click", handleClick);

  // ハンドラの参照を保存
  extendedWell.__mikotoHandler = handleClick;
  extendedWell.__mikotoCleanup = true;
};

export const CourseListEnhancer: React.FC = () => {
  useEffect(() => {
    const processWells = () => {
      const wells = document.querySelectorAll(".well");
      wells.forEach((well) => {
        const extendedWell = well as ExtendedHTMLElement;
        if (!extendedWell.__mikotoCleanup) {
          setupWellClickHandler(well as HTMLElement);
        }
      });
    };

    // 初回処理
    processWells();

    // ブラウザの戻る/進むボタンでページが復元された時の処理
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // ページがキャッシュから復元された場合、すべてのwellのマークをリセットして再処理
        const wells = document.querySelectorAll(".well");
        wells.forEach((well) => {
          const extendedWell = well as ExtendedHTMLElement;
          extendedWell.__mikotoCleanup = false;
        });
        processWells();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    // MutationObserverで要素の追加・変更を監視
    const observer = new MutationObserver((_) => {
      processWells();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, []);

  return null;
};
