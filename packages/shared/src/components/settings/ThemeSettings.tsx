import { Moon, Sun } from "lucide-react";
import type { Theme } from "../../types";
import {
  section,
  sectionTitle,
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../styles/commonStyles";

interface ThemeSettingsProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSettings = ({ theme, onThemeChange }: ThemeSettingsProps) => {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>テーマ設定</h2>
      <div style={{ display: "flex", gap: spacing.sm }}>
        <button
          type="button"
          onClick={() => onThemeChange("light")}
          style={{
            padding: "10px 20px",
            fontSize: fontSize.base,
            fontWeight: fontWeight.medium,
            backgroundColor: theme === "light" ? colors.primary : colors.bgGray,
            color: theme === "light" ? colors.bgWhite : colors.textMedium,
            border: "none",
            borderRadius: borderRadius.xl,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Sun size={20} aria-hidden="true" />
          ライトテーマ
        </button>
        <button
          type="button"
          onClick={() => onThemeChange("dark")}
          style={{
            padding: "10px 20px",
            fontSize: fontSize.base,
            fontWeight: fontWeight.medium,
            backgroundColor: theme === "dark" ? colors.primary : colors.bgGray,
            color: theme === "dark" ? colors.bgWhite : colors.textMedium,
            border: "none",
            borderRadius: borderRadius.xl,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Moon size={20} aria-hidden="true" />
          ダークテーマ
        </button>
      </div>
    </div>
  );
};
