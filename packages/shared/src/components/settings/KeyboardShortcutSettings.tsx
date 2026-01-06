import type { KeyboardShortcutSettings } from "../../types";
import { getSubmitShortcutLabel } from "../../utils/platform";
import { settingsStyles } from "./settingsStyles";

interface ShortcutSettingsProps {
  shortcuts: KeyboardShortcutSettings;
  onShortcutToggle: (key: keyof KeyboardShortcutSettings) => void;
}

export const ShortcutSettings = ({
  shortcuts,
  onShortcutToggle,
}: ShortcutSettingsProps) => {
  const submitShortcutLabel = getSubmitShortcutLabel();

  return (
    <div style={settingsStyles.section}>
      <h2 style={settingsStyles.sectionTitle}>キーボードショートカット</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label style={settingsStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={shortcuts.submitShortcut}
            onChange={() => onShortcutToggle("submitShortcut")}
            style={settingsStyles.checkbox}
          />
          <span>{submitShortcutLabel}</span>
        </label>
        <label style={settingsStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={shortcuts.numberKeyShortcut}
            onChange={() => onShortcutToggle("numberKeyShortcut")}
            style={settingsStyles.checkbox}
          />
          <span>数字キー (1-9) でページネーション</span>
        </label>
        <label style={settingsStyles.checkboxLabel}>
          <input
            type="checkbox"
            checked={shortcuts.arrowKeyShortcut}
            onChange={() => onShortcutToggle("arrowKeyShortcut")}
            style={settingsStyles.checkbox}
          />
          <span>Shift+左右矢印 でページ移動</span>
        </label>
      </div>
    </div>
  );
};
