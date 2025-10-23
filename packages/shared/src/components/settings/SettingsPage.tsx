import { useEffect, useState, type CSSProperties } from "react";
import { BookOpen, Calendar, Settings as SettingsIcon } from "lucide-react";
import type {
  KeyboardShortcutSettings,
  Theme,
  CampusId,
  NotificationSettings as NotificationSettingsType,
} from "../../types";
import type { StorageManager } from "../../storage/manager";
import { StorageProvider, useStorageManager } from "../../storage/context";
import { ThemeSettings } from "./ThemeSettings";
import { ShortcutSettings } from "./KeyboardShortcutSettings";
import { CampusSettings } from "./CampusSettings";
import { InstructorSettings } from "./InstructorSettings";
import { NotificationSettings } from "./NotificationSettings";
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
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    marginBottom: "-2px",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
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
  const [defaultCampus, setDefaultCampus] = useState<CampusId | undefined>(
    undefined,
  );
  const [instructors, setInstructors] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettingsType>({
      enabled: false,
      timings: [-10],
    });

  useEffect(() => {
    const loadSettings = async () => {
      const savedTheme = await storageManager.getTheme();
      const keyboardShortcuts = await storageManager.getKeyboardShortcuts();
      const campusSettings = await storageManager.getCampusSettings();
      const instructorList = await storageManager.getInstructors();
      const notifications = await storageManager.getNotificationSettings();
      setTheme(savedTheme);
      setShortcuts(keyboardShortcuts);
      setDefaultCampus(campusSettings.defaultCampus);
      setInstructors(instructorList);
      setNotificationSettings(notifications);
    };
    loadSettings();
  }, [storageManager]);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    await storageManager.setTheme(newTheme);
  };

  const handleInstructorSave = async (updatedInstructors: string[]) => {
    setInstructors(updatedInstructors);
    await storageManager.saveInstructors(updatedInstructors);
  };

  const handleShortcutToggle = async (key: keyof KeyboardShortcutSettings) => {
    const newShortcuts = { ...shortcuts, [key]: !shortcuts[key] };
    setShortcuts(newShortcuts);
    await storageManager.setKeyboardShortcuts(newShortcuts);
  };

  const handleCampusChange = async (newCampus: CampusId | undefined) => {
    setDefaultCampus(newCampus);
    await storageManager.setCampusSettings({ defaultCampus: newCampus });
  };

  const handleNotificationSettingsChange = async (
    newSettings: NotificationSettingsType,
  ) => {
    setNotificationSettings(newSettings);
    await storageManager.setNotificationSettings(newSettings);
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
          <SettingsIcon size={16} aria-hidden="true" />
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
          <BookOpen size={16} aria-hidden="true" />
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
          <Calendar size={16} aria-hidden="true" />
          時間割編集
        </button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === "general" && (
          <>
            <ThemeSettings theme={theme} onThemeChange={handleThemeChange} />
            <CampusSettings
              defaultCampus={defaultCampus}
              onCampusChange={handleCampusChange}
            />
            <NotificationSettings
              settings={notificationSettings}
              onSettingsChange={handleNotificationSettingsChange}
            />
            <ShortcutSettings
              shortcuts={shortcuts}
              onShortcutToggle={handleShortcutToggle}
            />
          </>
        )}

        {activeTab === "courses" && (
          <>
            <InstructorSettings
              instructors={instructors}
              onSave={handleInstructorSave}
            />
            <CourseList />
          </>
        )}

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
