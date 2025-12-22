import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SlideTextEditorProps = {
  text: string;
  onCopy: (text: string) => void;
  onClose: () => void;
};

export const SlideTextEditor: React.FC<SlideTextEditorProps> = ({
  text,
  onCopy,
  onClose,
}) => {
  const [value, setValue] = useState(text);

  useEffect(() => {
    setValue(text);
  }, [text]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="mikoto-slide-editor-overlay" role="dialog" aria-modal="true">
      <div className="mikoto-slide-editor-container">
        <textarea
          className="mikoto-slide-editor-textarea"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="mikoto-slide-editor-actions">
          <button
            type="button"
            className="mikoto-slide-editor-copy"
            onClick={() => {
              onCopy(value);
              onClose();
            }}
          >
            コピーして閉じる
          </button>
          <button
            type="button"
            className="mikoto-slide-editor-close"
            onClick={onClose}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
