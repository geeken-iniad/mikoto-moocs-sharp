import { Moon, Sun } from "lucide-react";
import type { Theme } from "../../types";

interface ThemeSettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSettings = ({ theme, onThemeChange }: ThemeSettingsProps) => {
  return (
    <div style={{ padding: "20px", borderBottom: "1px solid #dcdfe6" }}>
      <h2 style={{ marginBottom: "15px" }}>テーマ設定</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={() => onThemeChange("light")}
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
          onClick={() => onThemeChange("dark")}
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
  );
};
