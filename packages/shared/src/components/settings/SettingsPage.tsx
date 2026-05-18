import { BookOpen, Calendar, Settings as SettingsIcon } from "lucide-react";
import { type CSSProperties, useState } from "react";
import type {
  CampusSettings as CampusSettingsConfig,
  KeyboardShortcutSettings,
  NotificationSettings as NotificationSettingsType,
  Theme,
} from "../../settings/types";
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

interface SettingsPageViewProps {
  theme: Theme;
  shortcuts: KeyboardShortcutSettings;
  defaultCampus: DefaultCampus;
  instructors: string[];
  notificationSettings: NotificationSettingsType;
  submitShortcutLabel: string;
  onThemeChange: (theme: Theme) => void;
  onShortcutToggle: (key: keyof KeyboardShortcutSettings) => void;
  onCampusChange: (campus: DefaultCampus) => void;
  onInstructorSave: (instructors: string[]) => void;
  onNotificationSettingsChange: (settings: NotificationSettingsType) => void;
}

export const SettingsPageView = ({
  theme,
  shortcuts,
  defaultCampus,
  instructors,
  notificationSettings,
  submitShortcutLabel,
  onThemeChange,
  onShortcutToggle,
  onCampusChange,
  onInstructorSave,
  onNotificationSettingsChange,
}: SettingsPageViewProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("general");

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
            <ThemeSettings theme={theme} onThemeChange={onThemeChange} />
            <CampusSettings
              defaultCampus={defaultCampus}
              onCampusChange={onCampusChange}
            />
            <NotificationSettings
              settings={notificationSettings}
              onSettingsChange={onNotificationSettingsChange}
            />
            <ShortcutSettings
              shortcuts={shortcuts}
              submitShortcutLabel={submitShortcutLabel}
              onShortcutToggle={onShortcutToggle}
            />
          </>
        )}

        {activeTab === "courses" && (
          <>
            <InstructorSettings
              instructors={instructors}
              onSave={onInstructorSave}
            />
            <CourseList />
          </>
        )}

        {activeTab === "schedule" && <ScheduleEditor />}
      </div>
    </div>
  );
};
