import { useEffect, useState } from "react";
import "./App.css";

const DUAL_VIEW_STORAGE_KEY = "mikoto-dual-view";
const THEME_STORAGE_KEY = "mikoto-theme";

function App() {
  const [dualViewEnabled, setDualViewEnabled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const loadSettings = async () => {
      const dualView = await storage.getItem<boolean>(
        `local:${DUAL_VIEW_STORAGE_KEY}`,
      );
      const currentTheme = await storage.getItem<"light" | "dark">(
        `local:${THEME_STORAGE_KEY}`,
      );
      setDualViewEnabled(dualView || false);
      setTheme(currentTheme || "light");
    };
    loadSettings();
  }, []);

  const handleDualViewToggle = async () => {
    const newValue = !dualViewEnabled;
    setDualViewEnabled(newValue);
    await storage.setItem(`local:${DUAL_VIEW_STORAGE_KEY}`, newValue);
  };

  const handleThemeToggle = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await storage.setItem(`local:${THEME_STORAGE_KEY}`, newTheme);
  };

  return (
    <div className="popup-container">
      <h1>Mikoto (MOOCs #)</h1>
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
