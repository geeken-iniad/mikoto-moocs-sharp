import React from "react";

type SettingsButtonProps = {
  onClick: () => void;
};

export const SettingsButton = ({ onClick }: SettingsButtonProps) => {
  return (
    <button
      className="ms-settings-button"
      aria-label="Moocs Sharp 設定"
      onClick={onClick}
    >
      &#x2699;
    </button>
  );
};