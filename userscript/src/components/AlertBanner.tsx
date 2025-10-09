import React, { useEffect, useState } from "react";

const BANNER_AUTO_HIDE_MS = 5000;
const BANNER_TRANSITION_MS = 500;

type AlertBannerProps = {
  id: string;
  message: string;
  onClose: (id: string) => void;
};

const ALERT_DEFAULT_THEME = { background: "#007bff", color: "#ffffff" };
const ALERT_THEME_RULES = [
  {
    keywords: ["保存しました", "have been saved"],
    background: "#28a745",
    color: "#ffffff",
  },
  {
    keywords: ["失敗しました", "Failed to"],
    background: "#dc3545",
    color: "#ffffff",
  },
  {
    keywords: ["できません", "非公開です"],
    background: "#ffc107",
    color: "#212529",
  },
];

const resolveAlertTheme = (message: string) => {
  const matchedTheme = ALERT_THEME_RULES.find((theme) =>
    theme.keywords.some((keyword) => message.includes(keyword))
  );
  return matchedTheme
    ? { background: matchedTheme.background, color: matchedTheme.color }
    : ALERT_DEFAULT_THEME;
};

export const AlertBanner = ({ id, message, onClose }: AlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const theme = resolveAlertTheme(message);

  useEffect(() => {
    setIsVisible(true);
    const timeoutId = setTimeout(() => {
      handleClose();
    }, BANNER_AUTO_HIDE_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, BANNER_TRANSITION_MS);
  };

  return (
    <div
      id={id}
      role="alert"
      style={{
        position: "fixed",
        top: "100px",
        right: isVisible ? "20px" : "-400px",
        maxWidth: "350px",
        backgroundColor: theme.background,
        color: theme.color,
        padding: "15px 25px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        zIndex: "99999",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        fontSize: "16px",
        fontFamily: "sans-serif",
        opacity: isVisible ? "1" : "0",
        transition: `opacity ${BANNER_TRANSITION_MS}ms, right ${BANNER_TRANSITION_MS}ms`,
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, "<br>") }} />
      <button
        type="button"
        aria-label="閉じる"
        onClick={handleClose}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          fontSize: "24px",
          cursor: "pointer",
          opacity: "0.7",
          padding: "0 5px",
        }}
      >
        &times;
      </button>
    </div>
  );
};