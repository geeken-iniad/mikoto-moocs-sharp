import { useEffect } from "react";

export const useTextareaObserver = (
  onTextareaFound: (textarea: HTMLTextAreaElement) => void,
) => {
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            (node as Element).tagName?.toLowerCase() === "textarea" &&
            (node as Element).className === "form-control"
          ) {
            onTextareaFound(node as HTMLTextAreaElement);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [onTextareaFound]);
};
