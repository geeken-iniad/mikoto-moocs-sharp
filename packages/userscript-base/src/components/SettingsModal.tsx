import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import { SettingsPage, Z_INDEX } from "@mikoto-moocs-sharp/shared";

interface SettingsModalProps {
  storageManager: StorageManager;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal = ({
  storageManager,
  isOpen,
  onClose,
}: SettingsModalProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const modalContainer = document.createElement("div");
    modalContainer.setAttribute("data-mikoto-settings-modal", "true");
    document.body.appendChild(modalContainer);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setContainer(modalContainer);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      modalContainer.remove();
      setContainer(null);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !container) {
    return null;
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: Z_INDEX.SETTINGS_MODAL,
        overflow: "auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px 0",
      }}
    >
      <div
        onClick={(event) => {
          event.stopPropagation();
        }}
        style={{
          width: "min(960px, calc(100vw - 40px))",
          maxHeight: "calc(100vh - 80px)",
          backgroundColor: "white",
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
          borderRadius: "12px",
          display: "flex",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <header
            style={{
              position: "sticky",
              top: 0,
              backgroundColor: "white",
              borderBottom: "1px solid #dcdfe6",
              padding: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
              Mikoto MOOCs# 設定
            </h1>
            <button
              onClick={onClose}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              aria-label="閉じる"
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                padding: "5px 10px",
                transition: "color 0.2s",
                color: isHovered ? "#333" : "#666",
              }}
            >
              <i className="fa fa-times" />
            </button>
          </header>
          <div
            style={{
              padding: "20px",
            }}
          >
            <SettingsPage storageManager={storageManager} />
          </div>
        </div>
      </div>
    </div>,
    container,
  );
};
