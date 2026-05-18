import { useEffect, useId, useState } from "react";
import "./App.css";
import { getSubmitShortcutLabel } from "@mikoto-moocs-sharp/shared/settings";
import type {
  KeyboardShortcutSettings,
  Theme,
} from "@mikoto-moocs-sharp/shared/types";
import { storageManager } from "../utils/storage";

function App() {
  const [dualViewEnabled, setDualViewEnabled] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutSettings>({
    submitShortcut: false,
    numberKeyShortcut: false,
    arrowKeyShortcut: false,
  });
  const submitShortcutLabel = getSubmitShortcutLabel();
  const dualViewToggleId = useId();
  const themeToggleId = useId();
  const submitShortcutToggleId = useId();
  const numberShortcutToggleId = useId();
  const arrowShortcutToggleId = useId();

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
          <label htmlFor={dualViewToggleId}>スライド横並び表示</label>
          <input
            id={dualViewToggleId}
            type="checkbox"
            checked={dualViewEnabled}
            onChange={handleDualViewToggle}
          />
        </div>
        <div className="setting-item">
          <label htmlFor={themeToggleId}>ダークテーマ</label>
          <input
            id={themeToggleId}
            type="checkbox"
            checked={theme === "dark"}
            onChange={handleThemeToggle}
          />
        </div>
        <div className="setting-item">
          <label htmlFor={submitShortcutToggleId}>{submitShortcutLabel}</label>
          <input
            id={submitShortcutToggleId}
            type="checkbox"
            checked={shortcuts.submitShortcut}
            onChange={() => handleShortcutToggle("submitShortcut")}
          />
        </div>
        <div className="setting-item">
          <label htmlFor={numberShortcutToggleId}>
            数字キー (1-9) でページネーション
          </label>
          <input
            id={numberShortcutToggleId}
            type="checkbox"
            checked={shortcuts.numberKeyShortcut}
            onChange={() => handleShortcutToggle("numberKeyShortcut")}
          />
        </div>
        <div className="setting-item">
          <label htmlFor={arrowShortcutToggleId}>
            Shift+左右矢印 でページ移動
          </label>
          <input
            id={arrowShortcutToggleId}
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
