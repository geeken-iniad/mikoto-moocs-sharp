import React, { useCallback, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2 } from "lucide-react";

import { useTextareaObserver } from "../../hooks";
import type { ExtendedHTMLTextAreaElement } from "../../utils";
import { CharacterCounter } from "../ui";

const ResizeToggle: React.FC<{ textarea: HTMLTextAreaElement }> = ({
  textarea,
}) => {
  const [isHorizontalResizable, setIsHorizontalResizable] = useState(false);

  const handleToggle = () => {
    const newState = !isHorizontalResizable;
    setIsHorizontalResizable(newState);
    textarea.style.resize = newState ? "both" : "vertical";
  };

  return (
    <button
      onClick={handleToggle}
      style={{
        alignItems: "center",
        backgroundColor: isHorizontalResizable ? "#3471eb" : "#f0f0f0",
        border: "1px solid #ddd",
        borderRadius: "4px",
        color: isHorizontalResizable ? "white" : "#333",
        cursor: "pointer",
        display: "flex",
        fontSize: "12px",
        fontWeight: "500",
        gap: "6px",
        padding: "6px 12px",
      }}
      title="横方向のサイズ変更を切り替え"
    >
      <Maximize2 size={14} />
      横方向サイズ変更: {isHorizontalResizable ? "ON" : "OFF"}
    </button>
  );
};

const TextareaEnhancerContent: React.FC<{
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
    <div className="mikoto-textarea-enhancer-container">
      <div
        className="mikoto-button-group"
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "flex-end",
          marginTop: "8px",
        }}
      >
        <ResizeToggle textarea={textarea} />
      </div>
      <div className="mikoto-counter-container">
        <CharacterCounter value={value} />
      </div>
    </div>,
    container,
  );
};

export const TextareaEnhancer: React.FC = () => {
  const [textareas, setTextareas] = useState<HTMLTextAreaElement[]>([]);

  const handleTextareaFound = useCallback((textarea: HTMLTextAreaElement) => {
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
        <TextareaEnhancerContent
          key={textarea.toString()}
          textarea={textarea}
        />
      ))}
    </>
  );
};
