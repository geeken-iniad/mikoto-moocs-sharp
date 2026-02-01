import { useEffect, useState } from "react";
import { useScheduleStore } from "../../hooks/schedule/useScheduleStore";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { useStorageManager } from "../../storage/context";
import { getClassStatusByUrl } from "../../utils/currentClass";
import { createSubjectExtractor } from "../../utils/subjectExtractor";

interface ExtendedHTMLElement extends HTMLElement {
  __mikotoCleanup?: boolean;
  __mikotoHandler?: (e: Event) => void;
  __mikotoClassBadge?: HTMLDivElement;
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

const applyClassHighlight = (
  well: HTMLElement,
  status: "current" | "next" | null,
): void => {
  const extendedWell = well as ExtendedHTMLElement;

  // Remove existing classes and badge
  well.classList.remove("mikoto-current-class", "mikoto-next-class");
  if (extendedWell.__mikotoClassBadge) {
    extendedWell.__mikotoClassBadge.remove();
    extendedWell.__mikotoClassBadge = undefined;
  }

  if (!status) return;

  // Apply new class
  well.classList.add(
    status === "current" ? "mikoto-current-class" : "mikoto-next-class",
  );

  // Add badge
  const badge = document.createElement("div");
  badge.className = `mikoto-class-badge mikoto-class-badge-${status}`;
  badge.textContent = status === "current" ? "今" : "次";
  well.style.position = "relative";
  well.appendChild(badge);
  extendedWell.__mikotoClassBadge = badge;
};

export const CourseListEnhancer = () => {
  const storageManager = useStorageManager();
  const { store } = useScheduleStore();
  const currentTime = useCurrentTime();
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Load active schedule ID
  useEffect(() => {
    const loadActiveSchedule = async () => {
      const activeId = await storageManager.getActiveScheduleId();
      setActiveScheduleId(activeId);
    };
    loadActiveSchedule();
  }, [storageManager]);

  // Watch for changes to active schedule ID
  useEffect(() => {
    const unwatch = storageManager.watchActiveScheduleId((newActiveId) => {
      setActiveScheduleId(newActiveId);
    });
    return unwatch;
  }, [storageManager]);

  useEffect(() => {
    const extractAndSaveSubjects = createSubjectExtractor(storageManager);

    const processWells = () => {
      const wells = document.querySelectorAll(".well");
      wells.forEach((well) => {
        const extendedWell = well as ExtendedHTMLElement;
        if (!extendedWell.__mikotoCleanup) {
          setupWellClickHandler(well as HTMLElement);
        }

        // Apply class highlighting based on URL
        const link = well.querySelector("a.btn-primary") as HTMLAnchorElement;
        if (link && link.href) {
          const status = getClassStatusByUrl(
            store,
            activeScheduleId,
            link.href,
            currentTime,
          );
          applyClassHighlight(well as HTMLElement, status);
        } else {
          applyClassHighlight(well as HTMLElement, null);
        }
      });

      // 科目名を抽出して保存
      extractAndSaveSubjects();
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
    const observer = new MutationObserver(() => {
      processWells();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      observer.disconnect();
    };
  }, [storageManager, store, activeScheduleId, currentTime]);

  return null;
};
