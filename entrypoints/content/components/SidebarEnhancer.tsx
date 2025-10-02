import React, { useCallback } from "react";
import { CONFIG } from "./config";
import { useElementObserver } from "./hooks";
import { utils } from "./utils";

export const SidebarEnhancer: React.FC = () => {
  const handleSidebarElements = useCallback((elements: NodeListOf<Element>) => {
    elements.forEach((span) => {
      const textContent = span.textContent || "";
      const parentLi = span.closest("li") as HTMLElement;

      if (utils.containsKeywords(textContent, CONFIG.WORDS.attendances)) {
        utils.applyStyles(span as HTMLElement, {
          color: CONFIG.STYLES.attendance.color,
        });
        if (parentLi) {
          utils.applyStyles(parentLi, {
            backgroundColor: CONFIG.STYLES.attendance.backgroundColor,
          });
        }
      } else if (
        utils.containsKeywords(textContent, CONFIG.WORDS.assignments)
      ) {
        utils.applyStyles(span as HTMLElement, {
          color: CONFIG.STYLES.assignment.color,
        });
        if (parentLi) {
          utils.applyStyles(parentLi, {
            backgroundColor: CONFIG.STYLES.assignment.backgroundColor,
          });
        }
      }
    });
  }, []);

  useElementObserver("span.sidebar-menu-text", handleSidebarElements);

  return null;
};
