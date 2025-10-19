import {
  ScheduleEditor,
  StorageProvider,
  type Theme,
  type KeyboardShortcutSettings,
  getSubmitShortcutLabel,
} from "@mikoto-moocs-sharp/shared";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { storageManager } from "../utils/storage";

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutSettings>({
    submitShortcut: false,
    numberKeyShortcut: false,
    arrowKeyShortcut: false,
  });
  const submitShortcutLabel = getSubmitShortcutLabel();

  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await storageManager.getTheme();
      const keyboardShortcuts = await storageManager.getKeyboardShortcuts();
      setTheme(savedTheme);
      setShortcuts(keyboardShortcuts);
    };
    loadSettings();
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    await storageManager.setTheme(newTheme);
  };

  const handleShortcutToggle = async (key: keyof KeyboardShortcutSettings) => {
    const newShortcuts = { ...shortcuts, [key]: !shortcuts[key] };
    setShortcuts(newShortcuts);
    await storageManager.setKeyboardShortcuts(newShortcuts);
  };

  return (
    <StorageProvider storageManager={storageManager}>
      <div>
        <div style={{ padding: "20px", borderBottom: "1px solid #dcdfe6" }}>
          <h2 style={{ marginBottom: "15px" }}>テーマ設定</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleThemeChange("light")}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "500",
                backgroundColor: theme === "light" ? "#3471eb" : "#f0f0f0",
                color: theme === "light" ? "white" : "#333",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Sun size={20} />
              ライトテーマ
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                fontWeight: "500",
                backgroundColor: theme === "dark" ? "#3471eb" : "#f0f0f0",
                color: theme === "dark" ? "white" : "#333",
                border: "none",
                borderRadius: "7px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Moon size={20} />
              ダークテーマ
            </button>
          </div>
        </div>
        <div style={{ padding: "20px", borderBottom: "1px solid #dcdfe6" }}>
          <h2 style={{ marginBottom: "15px" }}>キーボードショートカット</h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
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
                onChange={() => handleShortcutToggle("submitShortcut")}
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
                onChange={() => handleShortcutToggle("numberKeyShortcut")}
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
                onChange={() => handleShortcutToggle("arrowKeyShortcut")}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span>Shift+左右矢印 でページ移動</span>
            </label>
          </div>
        </div>
        <ScheduleEditor />
      </div>
    </StorageProvider>
  );
}

export default App;
