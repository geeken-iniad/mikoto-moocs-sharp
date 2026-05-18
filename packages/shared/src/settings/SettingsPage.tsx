import { useEffect, useState } from "react";
import { SettingsPageView } from "../components/settings/SettingsPage";
import { StorageProvider, useStorageManager } from "../storage/context";
import type { StorageManager } from "../storage/manager";
import {
  createDefaultCampusSettings,
  createDefaultKeyboardShortcuts,
  createDefaultNotificationSettings,
  createDefaultTheme,
} from "./defaults";
import type {
  CampusSettings as CampusSettingsConfig,
  KeyboardShortcutSettings,
  NotificationSettings,
  Theme,
} from "./types";

interface SettingsPageProps {
  storageManager: StorageManager;
  submitShortcutLabel: string;
}

type DefaultCampus = CampusSettingsConfig["defaultCampus"];

const SettingsPageContainer = ({ submitShortcutLabel }: SettingsPageProps) => {
  const storageManager = useStorageManager();
  const [theme, setTheme] = useState<Theme>(createDefaultTheme);
  const [shortcuts, setShortcuts] = useState<KeyboardShortcutSettings>(
    createDefaultKeyboardShortcuts,
  );
  const [defaultCampus, setDefaultCampus] = useState<DefaultCampus>(
    createDefaultCampusSettings().defaultCampus,
  );
  const [instructors, setInstructors] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(createDefaultNotificationSettings);

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
    newSettings: NotificationSettings,
  ) => {
    setNotificationSettings(newSettings);
    await storageManager.setNotificationSettings(newSettings);
  };

  return (
    <SettingsPageView
      theme={theme}
      shortcuts={shortcuts}
      defaultCampus={defaultCampus}
      instructors={instructors}
      notificationSettings={notificationSettings}
      submitShortcutLabel={submitShortcutLabel}
      onThemeChange={handleThemeChange}
      onShortcutToggle={handleShortcutToggle}
      onCampusChange={handleCampusChange}
      onInstructorSave={handleInstructorSave}
      onNotificationSettingsChange={handleNotificationSettingsChange}
    />
  );
};

export const SettingsPage = (props: SettingsPageProps) => {
  return (
    <StorageProvider storageManager={props.storageManager}>
      <SettingsPageContainer {...props} />
    </StorageProvider>
  );
};
