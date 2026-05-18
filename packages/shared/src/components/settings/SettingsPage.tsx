import { BookOpen, Calendar, Settings as SettingsIcon } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import {
  createDefaultCampusSettings,
  createDefaultKeyboardShortcuts,
  createDefaultNotificationSettings,
  createDefaultTheme,
} from "../../settings/defaults";
import type {
  CampusSettings as CampusSettingsConfig,
  KeyboardShortcutSettings,
  NotificationSettings as NotificationSettingsType,
  Theme,
} from "../../settings/types";
import { StorageProvider, useStorageManager } from "../../storage/context";
import type { StorageManager } from "../../storage/manager";
import {
  colors,
  fontSize,
  fontWeight,
  spacing,
} from "../../styles/commonStyles";
import { CourseList } from "../schedule/CourseList";
import { ScheduleEditor } from "../schedule/ScheduleEditor";
import { CampusSettings } from "./CampusSettings";
import { InstructorSettings } from "./InstructorSettings";
import { ShortcutSettings } from "./KeyboardShortcutSettings";
import { NotificationSettings } from "./NotificationSettings";
import { ThemeSettings } from "./ThemeSettings";

interface SettingsPageProps {
  storageManager: StorageManager;
  submitShortcutLabel: string;
}

type Tab = "general" | "courses" | "schedule";
type DefaultCampus = CampusSettingsConfig["defaultCampus"];

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
  },
  tabBar: {
    display: "flex",
    borderBottom: `2px solid ${colors.borderLight}`,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  tab: {
    padding: "12px 24px",
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: colors.textLight,
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "transparent",
    marginBottom: "-2px",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  activeTab: {
    color: colors.primary,
    borderBottomColor: colors.primary,
  },
  tabContent: {
    width: "100%",
  },
};

interface SettingsPageContentProps {
  submitShortcutLabel: string;
}

const SettingsPageContent = ({
  submitShortcutLabel,
}: SettingsPageContentProps) => {
  const storageManager = useStorageManager();
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [theme, setTheme] = useState<Theme>(createDefaultTheme);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutSettings>(
    createDefaultKeyboardShortcuts,
  );
  const [defaultCampus, setDefaultCampus] = useState<DefaultCampus>(
    createDefaultCampusSettings().defaultCampus,
  );
  const [instructors, setInstructors] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettingsType>(createDefaultNotificationSettings);

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

  const handleCampusChange = async (newCampus: DefaultCampus) => {
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
              submitShortcutLabel={submitShortcutLabel}
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

export const SettingsPage = ({
  storageManager,
  submitShortcutLabel,
}: SettingsPageProps) => {
  return (
    <StorageProvider storageManager={storageManager}>
      <SettingsPageContent submitShortcutLabel={submitShortcutLabel} />
    </StorageProvider>
  );
};
