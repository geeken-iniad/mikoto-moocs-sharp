import { SettingsPage } from "@mikoto-moocs-sharp/shared";
import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import { useState } from "react";

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
  const [isHovered, setIsHovered] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "white",
        zIndex: 100000,
        overflow: "auto",
      }}
    >
      <div
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
      </div>
      <SettingsPage storageManager={storageManager} />
    </div>
  );
};
