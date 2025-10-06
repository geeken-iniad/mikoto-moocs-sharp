import React, { useCallback } from "react";
import { CONFIG } from "./config";
import { useElementObserver } from "./hooks";
import { utils } from "./utils";

export const ContentEnhancer: React.FC = () => {
  const handleContentItems = useCallback(() => {
    const main = document.querySelector(".content-wrapper");
    if (!main) {
      console.error(
        "[Mikoto (MOOCs #)]: .content-wrapper element was not found.",
      );
      return;
    }

    const listItems = Array.from(main.getElementsByTagName("li"));

    listItems.forEach((li) => {
      if (li.className === "active" && li.children[0]) {
        utils.applyStyles(li.children[0] as HTMLElement, {
          border: CONFIG.STYLES.activeBorder,
        });
      }

      const firstChild = li.children[0] as HTMLElement;
      if (!firstChild) return;

      const { textContent, title } = firstChild;

      // ページ送りボタンの場合はスキップ
      if (textContent === "«" || textContent === "»") return;

      if (utils.containsKeywords(title, [...CONFIG.WORDS.attendances])) {
        utils.applyStyles(firstChild, CONFIG.STYLES.attendance);
      } else if (utils.containsKeywords(title, CONFIG.WORDS.assignments)) {
        utils.applyStyles(firstChild, CONFIG.STYLES.assignment);
      }
    });
  }, []);

  useElementObserver(".content-wrapper li", handleContentItems);

  return null;
};
