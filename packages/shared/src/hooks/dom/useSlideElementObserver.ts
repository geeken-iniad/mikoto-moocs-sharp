import { useEffect, useRef } from "react";

import { isElementVisible, isTargetElement } from "../../utils/slide";

type SlideElementObserverHandlers = {
  onElementFound: (element: Element) => void;
  onElementRemoved?: (element: Element) => void;
};

const collectTargetElements = (node: Element) => {
  if (node.tagName.toLowerCase() === "g") {
    return [node].filter(isTargetElement);
  }
  return Array.from(node.querySelectorAll("g")).filter(isTargetElement);
};

const isElementInDocument = (element: Element) =>
  document.body.contains(element);

export const useSlideElementObserver = (
  handlers: SlideElementObserverHandlers,
) => {
  const trackedElementsRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    const trackedElements = trackedElementsRef.current;

    const handleFound = (element: Element) => {
      if (!isElementVisible(element)) return;
      if (!trackedElements.has(element)) {
        trackedElements.add(element);
        handlers.onElementFound(element);
        return;
      }
      handlers.onElementFound(element);
    };

    const handleRemoved = (element: Element) => {
      if (!trackedElements.has(element)) return;
      trackedElements.delete(element);
      handlers.onElementRemoved?.(element);
    };

    const resyncElements = () => {
      const currentElements = Array.from(document.querySelectorAll("g"))
        .filter(isTargetElement)
        .filter(isElementVisible);

      const currentSet = new Set(currentElements);

      currentElements.forEach((element) => {
        if (!trackedElements.has(element)) {
          trackedElements.add(element);
        }
        handlers.onElementFound(element);
      });

      trackedElements.forEach((element) => {
        if (!currentSet.has(element) || !isElementInDocument(element)) {
          handleRemoved(element);
        }
      });
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            collectTargetElements(node).forEach(handleFound);
          });

          mutation.removedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            collectTargetElements(node).forEach(handleRemoved);
          });
        }

        if (mutation.type === "attributes") {
          const target = mutation.target;
          if (!(target instanceof Element)) return;

          const targetElements = collectTargetElements(target);
          targetElements.forEach((element) => {
            if (isElementVisible(element)) {
              handleFound(element);
            } else {
              handleRemoved(element);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden", "style"],
    });

    resyncElements();

    const handleResize = () => {
      resyncElements();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      trackedElements.clear();
    };
  }, [handlers]);
};
