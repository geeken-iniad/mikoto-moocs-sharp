import React, { useEffect, useMemo, useState } from "react";
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
  const [isDark, setIsDark] = useState(false);
  const [isCopyHovered, setIsCopyHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  useEffect(() => {
    setValue(text);
  }, [text]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const updateTheme = () => {
      setIsDark(document.body.classList.contains("mikoto-dark-theme"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

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

  const styles = useMemo(() => {
    const colors = isDark
      ? {
          overlay: "rgba(0, 0, 0, 0.55)",
          containerBg: "#2a2a2a",
          text: "#e0e0e0",
          textareaBg: "#333333",
          border: "#3a3a3a",
          buttonBg: "#333333",
          buttonHoverBg: "#3a3a3a",
          primaryBg: "#4a7bc8",
          primaryHoverBg: "#3a5fa8",
        }
      : {
          overlay: "rgba(0, 0, 0, 0.45)",
          containerBg: "#ffffff",
          text: "#333333",
          textareaBg: "#ffffff",
          border: "#dcdfe6",
          buttonBg: "#ffffff",
          buttonHoverBg: "#e0e0e0",
          primaryBg: "#3471eb",
          primaryHoverBg: "#0056b3",
        };

    return {
      overlay: {
        position: "fixed",
        inset: 0,
        background: colors.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
      } as React.CSSProperties,
      container: {
        width: "min(720px, 90vw)",
        background: colors.containerBg,
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        color: colors.text,
      } as React.CSSProperties,
      textarea: {
        minHeight: "220px",
        resize: "vertical",
        border: `1px solid ${colors.border}`,
        borderRadius: "10px",
        padding: "12px",
        fontSize: "14px",
        lineHeight: 1.5,
        color: colors.text,
        background: colors.textareaBg,
      } as React.CSSProperties,
      actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
      } as React.CSSProperties,
      baseButton: {
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        padding: "8px 14px",
        fontSize: "14px",
        cursor: "pointer",
        background: colors.buttonBg,
        color: colors.text,
        transition: "background-color 0.2s, border-color 0.2s",
      } as React.CSSProperties,
      copyButton: {
        background: isCopyHovered ? colors.primaryHoverBg : colors.primaryBg,
        borderColor: isCopyHovered ? colors.primaryHoverBg : colors.primaryBg,
        color: "#ffffff",
      } as React.CSSProperties,
      closeButton: {
        background: isCloseHovered ? colors.buttonHoverBg : colors.buttonBg,
      } as React.CSSProperties,
    };
  }, [isCloseHovered, isCopyHovered, isDark]);

  return createPortal(
    <div
      className="mikoto-slide-editor-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={styles.overlay}
    >
      <div
        className="mikoto-slide-editor-container"
        onClick={(event) => event.stopPropagation()}
        style={styles.container}
      >
        <textarea
          className="mikoto-slide-editor-textarea"
          style={styles.textarea}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <div className="mikoto-slide-editor-actions" style={styles.actions}>
          <button
            type="button"
            className="mikoto-slide-editor-copy"
            style={{ ...styles.baseButton, ...styles.copyButton }}
            onClick={() => {
              onCopy(value);
              onClose();
            }}
            onMouseEnter={() => setIsCopyHovered(true)}
            onMouseLeave={() => setIsCopyHovered(false)}
          >
            コピーして閉じる
          </button>
          <button
            type="button"
            className="mikoto-slide-editor-close"
            style={{ ...styles.baseButton, ...styles.closeButton }}
            onClick={onClose}
            onMouseEnter={() => setIsCloseHovered(true)}
            onMouseLeave={() => setIsCloseHovered(false)}
          >
            閉じる
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
