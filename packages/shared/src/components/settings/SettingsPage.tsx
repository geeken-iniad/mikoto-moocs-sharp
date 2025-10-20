import { useEffect, useState } from "react";
import type { KeyboardShortcutSettings, Theme } from "../../types";
import type { StorageManager } from "../../storage/manager";
import { StorageProvider, useStorageManager } from "../../storage/context";
import { ScheduleEditor } from "../schedule/ScheduleEditor";
import { ThemeSettings } from "./ThemeSettings";
import { ShortcutSettings } from "./KeyboardShortcutSettings";

interface SettingsPageProps {
  storageManager: StorageManager;
}

const SettingsPageContent = () => {
  const storageManager = useStorageManager();
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
    <div>
      <ThemeSettings theme={theme} onThemeChange={handleThemeChange} />
      <ShortcutSettings
        shortcuts={shortcuts}
        onShortcutToggle={handleShortcutToggle}
      />
      <ScheduleEditor />
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
