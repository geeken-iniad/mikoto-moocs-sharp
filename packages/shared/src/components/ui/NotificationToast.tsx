import { useEffect, useState, type CSSProperties } from "react";
import { Bell, X } from "lucide-react";

export interface NotificationToastProps {
  title: string;
  message: string;
  duration?: number; // ミリ秒単位、デフォルトは5000ms
  onClose?: () => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: "fixed",
    top: "1rem",
    right: "1rem",
    zIndex: 100000,
    maxWidth: "400px",
    backgroundColor: "white",
    borderRadius: "0.5rem",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    padding: "1rem",
    display: "flex",
    gap: "0.75rem",
    animation: "slideIn 0.3s ease-out",
  },
  iconContainer: {
    flexShrink: 0,
    width: "2.5rem",
    height: "2.5rem",
    backgroundColor: "#dbeafe",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "0.25rem",
  },
  message: {
    fontSize: "0.875rem",
    color: "#6b7280",
    whiteSpace: "pre-line",
  },
  closeButton: {
    flexShrink: 0,
    padding: "0.25rem",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#9ca3af",
    borderRadius: "0.25rem",
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s, background-color 0.2s",
  },
};

// アニメーションをグローバルに追加
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
if (!document.head.querySelector("style[data-mikoto-toast-animation]")) {
  styleSheet.setAttribute("data-mikoto-toast-animation", "true");
  document.head.appendChild(styleSheet);
}

export const NotificationToast = ({
  title,
  message,
  duration = 5000,
  onClose,
}: NotificationToastProps) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // アニメーション時間
  };

  return (
    <div
      style={{
        ...styles.container,
        animation: isClosing
          ? "slideOut 0.3s ease-in"
          : "slideIn 0.3s ease-out",
      }}
    >
      <div style={styles.iconContainer}>
        <Bell size={20} color="#3b82f6" aria-hidden="true" />
      </div>
      <div style={styles.content}>
        <div style={styles.title}>{title}</div>
        <div style={styles.message}>{message}</div>
      </div>
      <button
        type="button"
        style={styles.closeButton}
        onClick={handleClose}
        aria-label="通知を閉じる"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#1f2937";
          e.currentTarget.style.backgroundColor = "#f3f4f6";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#9ca3af";
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
