import { useEffect } from "react";
import { subscribeMutation } from "./observerBus";

export const useElementObserver = (
  selector: string,
  callback: (elements: NodeListOf<Element>) => void,
) => {
  useEffect(() => {
    const runCallback = () => {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        callback(elements);
      }
    };

    // Initial check
    runCallback();

    // Subscribe to shared observer bus instead of creating own MutationObserver
    const unsubscribe = subscribeMutation(
      document.body,
      { childList: true, subtree: true },
      runCallback,
    );

    return unsubscribe;
  }, [selector, callback]);
};
