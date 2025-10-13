import { useEffect } from "react";

export const useElementObserver = (
  selector: string,
  callback: (elements: NodeListOf<Element>) => void,
) => {
  useEffect(() => {
    console.log(`[Mikoto (MOOCs #)]: useElementObserver initialized for selector: ${selector}`);

    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`[Mikoto (MOOCs #)]: Found ${elements.length} elements for selector: ${selector}`);
        callback(elements);
      }
    });

    const elements = document.querySelectorAll(selector);
    console.log(`[Mikoto (MOOCs #)]: Initial check found ${elements.length} elements for selector: ${selector}`);
    if (elements.length > 0) {
      callback(elements);
    }

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      console.log(`[Mikoto (MOOCs #)]: useElementObserver disconnected for selector: ${selector}`);
      observer.disconnect();
    };
  }, [selector, callback]);
};
