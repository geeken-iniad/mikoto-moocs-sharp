import React, { useCallback, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";

import { useTextareaObserver } from "../../hooks";
import type { ExtendedHTMLTextAreaElement } from "../../utils";
import { CharacterCounter } from "../ui";

const COUNTER_CONTAINER_CLASS = "mikoto-counter-container";

const createCounterContainer = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.className = COUNTER_CONTAINER_CLASS;
  return container;
};

const insertCounterContainer = (
  textarea: HTMLTextAreaElement,
  container: HTMLDivElement,
): boolean => {
  const wrapper = textarea.closest("div");
  if (!wrapper) return false;

  if (textarea.nextSibling) {
    wrapper.insertBefore(container, textarea.nextSibling);
  } else {
    wrapper.appendChild(container);
  }
  return true;
};

const renderCounter = (root: Root, value: string): void => {
  root.render(<CharacterCounter value={value} />);
};

const cleanupCounter = (
  textarea: HTMLTextAreaElement,
  container: HTMLDivElement,
  root: Root,
  handleInput: () => void,
): void => {
  textarea.removeEventListener("input", handleInput);
  root.unmount();
  container.remove();
};

export const TextareaEnhancer: React.FC = () => {
  const rootsRef = useRef<Map<HTMLTextAreaElement, Root>>(new Map());

  const handleTextareaFound = useCallback((textarea: HTMLTextAreaElement) => {
    const counterContainer = createCounterContainer();

    if (!insertCounterContainer(textarea, counterContainer)) {
      return;
    }

    const root = createRoot(counterContainer);
    rootsRef.current.set(textarea, root);

    const handleInput = (): void => {
      renderCounter(root, textarea.value);
    };

    textarea.addEventListener("input", handleInput);
    renderCounter(root, textarea.value);

    const cleanup = (): void => {
      cleanupCounter(textarea, counterContainer, root, handleInput);
      rootsRef.current.delete(textarea);
    };

    (textarea as ExtendedHTMLTextAreaElement).__mikotoCleanup = cleanup;
  }, []);

  useTextareaObserver(handleTextareaFound);

  return null;
};
