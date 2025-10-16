import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useTextareaObserver } from "../../hooks";
import type { ExtendedHTMLTextAreaElement } from "../../types";
import { ensureTextareaId } from "../../utils/textarea";
import { CharacterCounter } from "../CharacterCounter";

const TextareaCounterContent: React.FC<{
  textarea: HTMLTextAreaElement;
}> = ({ textarea }) => {
  const [value, setValue] = useState(textarea.value);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrapper = textarea.closest("div");
    if (!wrapper) return;

    const tempDiv = document.createElement("div");

    if (textarea.nextSibling) {
      wrapper.insertBefore(tempDiv, textarea.nextSibling);
    } else {
      wrapper.appendChild(tempDiv);
    }

    setContainer(tempDiv);

    return () => {
      tempDiv.remove();
    };
  }, [textarea]);

  useEffect(() => {
    const handleInput = () => {
      setValue(textarea.value);
    };

    textarea.addEventListener("input", handleInput);
    return () => {
      textarea.removeEventListener("input", handleInput);
    };
  }, [textarea]);

  if (!container) return null;

  return createPortal(
    <div className="mikoto-counter-container">
      <CharacterCounter value={value} />
    </div>,
    container,
  );
};

/**
 * テキストエリアに文字数カウンターを追加するコンポーネント
 * - 通常の文字数
 * - 改行を除く文字数
 * - 改行・空白を除く文字数
 */
export const TextareaCounter: React.FC = () => {
  const [textareas, setTextareas] = useState<HTMLTextAreaElement[]>([]);

  const handleTextareaFound = useCallback((textarea: HTMLTextAreaElement) => {
    ensureTextareaId(textarea);

    setTextareas((prev) => {
      if (prev.includes(textarea)) return prev;
      return [...prev, textarea];
    });

    const cleanup = (): void => {
      setTextareas((prev) => prev.filter((t) => t !== textarea));
    };

    (textarea as ExtendedHTMLTextAreaElement).__mikotoCleanup = cleanup;
  }, []);

  useTextareaObserver(handleTextareaFound);

  return (
    <>
      {textareas.map((textarea) => (
        <TextareaCounterContent
          key={textarea.dataset.mikotoTextareaId ?? ensureTextareaId(textarea)}
          textarea={textarea}
        />
      ))}
    </>
  );
};
