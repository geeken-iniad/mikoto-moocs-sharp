import React, { useEffect } from "react";

interface ExtendedHTMLElement extends HTMLElement {
  __mikotoCleanup?: boolean;
  __mikotoHandler?: (e: Event) => void;
}

const setupWellClickHandler = (well: HTMLElement): void => {
  const handleClick = (e: Event): void => {
    console.log("[CourseListEnhancer] Well clicked", well);

    // リンク自体がクリックされた場合は何もしない
    const target = e.target as HTMLElement;
    if (target.tagName === "A" || target.closest("a")) {
      console.log("[CourseListEnhancer] Link clicked directly, skipping");
      return;
    }

    // well内のリンクを探してクリック
    const link = well.querySelector("a.btn") as HTMLAnchorElement;
    if (link) {
      console.log("[CourseListEnhancer] Clicking link", link.href);
      link.click();
    } else {
      console.log("[CourseListEnhancer] No link found in well");
    }
  };

  // 既存のハンドラを削除してから新しいハンドラを追加
  const extendedWell = well as ExtendedHTMLElement;
  if (extendedWell.__mikotoHandler) {
    well.removeEventListener("click", extendedWell.__mikotoHandler);
  }

  well.addEventListener("click", handleClick);
  console.log("[CourseListEnhancer] Handler attached to well", well);

  // ハンドラの参照を保存
  extendedWell.__mikotoHandler = handleClick;
  extendedWell.__mikotoCleanup = true;
};

export const CourseListEnhancer: React.FC = () => {
  useEffect(() => {
    const processWells = () => {
      const wells = document.querySelectorAll(".well");
      console.log(
        "[CourseListEnhancer] Processing wells, found:",
        wells.length,
      );
      wells.forEach((well) => {
        const extendedWell = well as ExtendedHTMLElement;
        if (!extendedWell.__mikotoCleanup) {
          console.log("[CourseListEnhancer] Setting up new well");
          setupWellClickHandler(well as HTMLElement);
        }
      });
    };

    // 初回処理
    console.log("[CourseListEnhancer] Initial setup");
    processWells();

    // ブラウザの戻る/進むボタンでページが復元された時の処理
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log(
          "[CourseListEnhancer] Page restored from cache, re-attaching handlers",
        );
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
    const observer = new MutationObserver((mutations) => {
      console.log(
        "[CourseListEnhancer] DOM mutation detected",
        mutations.length,
        "mutations",
      );
      processWells();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }, []);

  return null;
};
