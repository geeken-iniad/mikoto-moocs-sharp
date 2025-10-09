import React from "react";
import { useSettingsContext } from "../hooks/useSettingsContext";
import { ToggleSwitch } from "./ToggleSwitch";
import { Settings } from "../types/settings";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SETTINGS_CONFIG: { key: keyof Settings; label: string }[] = [
  { key: "enableRainbowAnimation", label: "レインボーアニメーション" },
  { key: "enableLayoutEnhancements", label: "レイアウト調整機能" },
  { key: "enableCustomAlerts", label: "カスタムアラート機能" },
  { key: "enableStyleImprovements", label: "その他スタイル改善" },
];

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { settings, saveSettings } = useSettingsContext();

  if (!isOpen) {
    return null;
  }

  const handleApply = () => {
    saveSettings(settings);
    window.location.reload();
  };

  return (
    <div className="ms-settings-modal-overlay" onClick={onClose}>
      <div className="ms-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ms-settings-modal-header">
          <h5 className="ms-settings-modal-title">Moocs Sharp 設定</h5>
          <button
            className="ms-settings-close-button"
            aria-label="閉じる"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="ms-settings-modal-body">
          {SETTINGS_CONFIG.map(({ key, label }) => (
            <div className="ms-settings-row" key={key}>
              <span className="ms-settings-label">{label}</span>
              <ToggleSwitch
                checked={settings[key]}
                onChange={(checked) => saveSettings({ [key]: checked })}
              />
            </div>
          ))}
        </div>
        <div className="ms-settings-modal-footer">
          <button className="ms-settings-apply-button" onClick={handleApply}>
            適用
          </button>
        </div>
      </div>
    </div>
  );
};