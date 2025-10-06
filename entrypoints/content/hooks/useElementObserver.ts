import { useEffect } from "react";

export const useElementObserver = (
  selector: string,
  callback: (elements: NodeListOf<Element>) => void,
) => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        callback(elements);
      }
    });

    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      callback(elements);
    }

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [selector, callback]);
};
