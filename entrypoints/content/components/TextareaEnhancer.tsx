import React, { createElement, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { CharacterCounter } from "./CharacterCounter";
import { useTextareaObserver } from "./hooks";
import type { ExtendedHTMLTextAreaElement } from "./types";

export const TextareaEnhancer: React.FC = () => {
  const [, setTextareaCounters] = useState<Map<HTMLTextAreaElement, string>>(
    new Map(),
  );

  const handleTextareaFound = useCallback((textarea: HTMLTextAreaElement) => {
    const wrapper = textarea.closest("div");
    if (!wrapper) return;

    const counterContainer = document.createElement("div");
    counterContainer.className = "mikoto-counter-container";
    
    if (textarea.nextSibling) {
      wrapper.insertBefore(counterContainer, textarea.nextSibling);
    } else {
      wrapper.appendChild(counterContainer);
    }

    const root = createRoot(counterContainer);

    const handleInput = () => {
      setTextareaCounters(
        (prev) => new Map(prev.set(textarea, textarea.value)),
      );
      root.render(createElement(CharacterCounter, { value: textarea.value }));
    };

    textarea.addEventListener("input", handleInput);

    root.render(createElement(CharacterCounter, { value: textarea.value }));

    const cleanup = () => {
      textarea.removeEventListener("input", handleInput);
      root.unmount();
      if (counterContainer.parentNode) {
        counterContainer.parentNode.removeChild(counterContainer);
      }
      setTextareaCounters((prev) => {
        const newMap = new Map(prev);
        newMap.delete(textarea);
        return newMap;
      });
    };

    (textarea as ExtendedHTMLTextAreaElement).__mikotoCleanup = cleanup;
  }, []);

  useTextareaObserver(handleTextareaFound);

  return null;
};
