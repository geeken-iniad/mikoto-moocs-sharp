import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { ScheduleEditor } from "./components/ScheduleEditor";
import type { Theme } from "@mikoto-moocs-sharp/shared";
import { storageManager } from "../utils/storage";

function App() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await storageManager.getTheme();
      setTheme(savedTheme);
    };
    loadTheme();
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    await storageManager.setTheme(newTheme);
  };

  return (
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
      <ScheduleEditor />
    </div>
  );
}

export default App;
