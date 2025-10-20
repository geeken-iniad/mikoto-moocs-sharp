import { useEffect, useState, type CSSProperties } from "react";
import type { KeyboardShortcutSettings, Theme } from "../../types";
import type { StorageManager } from "../../storage/manager";
import { StorageProvider, useStorageManager } from "../../storage/context";
import { ThemeSettings } from "./ThemeSettings";
import { ShortcutSettings } from "./KeyboardShortcutSettings";
import { ScheduleEditor } from "../schedule/ScheduleEditor";
import { CourseList } from "../schedule/CourseList";

interface SettingsPageProps {
  storageManager: StorageManager;
}

type Tab = "general" | "courses" | "schedule";

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
  },
  tabBar: {
    display: "flex",
    borderBottom: "2px solid #e5e7eb",
    marginBottom: "1.5rem",
    gap: "0.5rem",
  },
  tab: {
    padding: "0.75rem 1.5rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#6b7280",
    borderBottom: "2px solid transparent",
    marginBottom: "-2px",
    transition: "all 0.2s",
  },
  activeTab: {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
  },
  tabContent: {
    width: "100%",
  },
};

const SettingsPageContent = () => {
  const storageManager = useStorageManager();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [theme, setTheme] = useState<Theme>("light");
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutSettings>({
    submitShortcut: false,
    numberKeyShortcut: false,
    arrowKeyShortcut: false,
  });

  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await storageManager.getTheme();
      const keyboardShortcuts = await storageManager.getKeyboardShortcuts();
      setTheme(savedTheme);
      setShortcuts(keyboardShortcuts);
    };
    loadSettings();
  }, [storageManager]);

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
    <div style={styles.container}>
      <div style={styles.tabBar}>
        <button
          type="button"
          style={{
            ...styles.tab,
            ...(activeTab === "general" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("general")}
        >
          一般設定
        </button>
        <button
          type="button"
          style={{
            ...styles.tab,
            ...(activeTab === "courses" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("courses")}
        >
          コース管理
        </button>
        <button
          type="button"
          style={{
            ...styles.tab,
            ...(activeTab === "schedule" ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab("schedule")}
        >
          時間割編集
        </button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === "general" && (
          <>
            <ThemeSettings theme={theme} onThemeChange={handleThemeChange} />
            <ShortcutSettings
              shortcuts={shortcuts}
              onShortcutToggle={handleShortcutToggle}
            />
          </>
        )}

        {activeTab === "courses" && <CourseList />}

        {activeTab === "schedule" && <ScheduleEditor />}
      </div>
    </div>
  );
};

export const SettingsPage = ({ storageManager }: SettingsPageProps) => {
  return (
    <StorageProvider storageManager={storageManager}>
      <SettingsPageContent />
    </StorageProvider>
  );
};
