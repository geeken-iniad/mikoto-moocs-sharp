import type { KeyboardShortcutSettings } from "../../settings/types";
import {
  checkbox,
  checkboxLabel,
  section,
  sectionTitle,
  spacing,
} from "../../styles/commonStyles";
import { getSubmitShortcutLabel } from "../../utils/platform";

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
    <div style={section}>
      <h2 style={sectionTitle}>キーボードショートカット</h2>
      <div
        style={{ display: "flex", flexDirection: "column", gap: spacing.md }}
      >
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={shortcuts.submitShortcut}
            onChange={() => onShortcutToggle("submitShortcut")}
            style={checkbox}
          />
          <span>{submitShortcutLabel}</span>
        </label>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={shortcuts.numberKeyShortcut}
            onChange={() => onShortcutToggle("numberKeyShortcut")}
            style={checkbox}
          />
          <span>数字キー (1-9) でページネーション</span>
        </label>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={shortcuts.arrowKeyShortcut}
            onChange={() => onShortcutToggle("arrowKeyShortcut")}
            style={checkbox}
          />
          <span>Shift+左右矢印 でページ移動</span>
        </label>
      </div>
    </div>
  );
};
