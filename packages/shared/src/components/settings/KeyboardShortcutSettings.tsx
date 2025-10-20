import type { KeyboardShortcutSettings } from "../../types";
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
    <div style={{ padding: "20px", borderBottom: "1px solid #dcdfe6" }}>
      <h2 style={{ marginBottom: "15px" }}>キーボードショートカット</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={shortcuts.submitShortcut}
            onChange={() => onShortcutToggle("submitShortcut")}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span>{submitShortcutLabel}</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={shortcuts.numberKeyShortcut}
            onChange={() => onShortcutToggle("numberKeyShortcut")}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span>数字キー (1-9) でページネーション</span>
        </label>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={shortcuts.arrowKeyShortcut}
            onChange={() => onShortcutToggle("arrowKeyShortcut")}
            style={{ width: "18px", height: "18px", cursor: "pointer" }}
          />
          <span>Shift+左右矢印 でページ移動</span>
        </label>
      </div>
    </div>
  );
};
