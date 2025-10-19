import { useEffect, useState } from "react";
import "./App.css";
import type {
  Theme,
  KeyboardShortcutSettings,
} from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../utils/storage";

function App() {
  const [dualViewEnabled, setDualViewEnabled] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutSettings>({
    submitShortcut: false,
    numberKeyShortcut: false,
    arrowKeyShortcut: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const dualView = await storageManager.getDualView();
      const currentTheme = await storageManager.getTheme();
      const keyboardShortcuts = await storageManager.getKeyboardShortcuts();
      setDualViewEnabled(dualView);
      setTheme(currentTheme);
      setShortcuts(keyboardShortcuts);
    };
    loadSettings();
  }, []);

  const handleDualViewToggle = async () => {
    const newValue = !dualViewEnabled;
    setDualViewEnabled(newValue);
    await storageManager.setDualView(newValue);
  };

  const handleThemeToggle = async () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await storageManager.setTheme(newTheme);
  };

  const handleShortcutToggle = async (key: keyof KeyboardShortcutSettings) => {
    const newShortcuts = { ...shortcuts, [key]: !shortcuts[key] };
    setShortcuts(newShortcuts);
    await storageManager.setKeyboardShortcuts(newShortcuts);
  };

  return (
    <div className="popup-container">
      <h1>Mikoto (MOOCs#)</h1>
      <div className="settings">
        <div className="setting-item">
          <label htmlFor="dual-view-toggle">スライド横並び表示</label>
          <input
            id="dual-view-toggle"
            type="checkbox"
            checked={dualViewEnabled}
            onChange={handleDualViewToggle}
          />
        </div>
        <div className="setting-item">
          <label htmlFor="theme-toggle">ダークテーマ</label>
          <input
            id="theme-toggle"
            type="checkbox"
            checked={theme === "dark"}
            onChange={handleThemeToggle}
          />
        </div>
        <div className="setting-item">
          <label htmlFor="submit-shortcut-toggle">
            Ctrl/Cmd+Enter でフォーム提出
          </label>
          <input
            id="submit-shortcut-toggle"
            type="checkbox"
            checked={shortcuts.submitShortcut}
            onChange={() => handleShortcutToggle("submitShortcut")}
          />
        </div>
        <div className="setting-item">
          <label htmlFor="number-shortcut-toggle">
            数字キー (1-9) でページネーション
          </label>
          <input
            id="number-shortcut-toggle"
            type="checkbox"
            checked={shortcuts.numberKeyShortcut}
            onChange={() => handleShortcutToggle("numberKeyShortcut")}
          />
        </div>
        <div className="setting-item">
          <label htmlFor="arrow-shortcut-toggle">
            Shift+左右矢印 でページ移動
          </label>
          <input
            id="arrow-shortcut-toggle"
            type="checkbox"
            checked={shortcuts.arrowKeyShortcut}
            onChange={() => handleShortcutToggle("arrowKeyShortcut")}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
