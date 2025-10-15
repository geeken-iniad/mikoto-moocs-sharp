import { useEffect, useState } from "react";
import "./App.css";
import type { Theme } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../utils/storage";

function App() {
  const [dualViewEnabled, setDualViewEnabled] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const loadSettings = async () => {
      const dualView = await storageManager.getDualView();
      const currentTheme = await storageManager.getTheme();
      setDualViewEnabled(dualView);
      setTheme(currentTheme);
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
      </div>
    </div>
  );
}

export default App;
