import { useState, useEffect } from "react";
import { Settings } from "../types/settings";

const SETTINGS_KEY = "moocsSharpSettings";

const DEFAULT_SETTINGS: Settings = {
  enableRainbowAnimation: true,
  enableLayoutEnhancements: true,
  enableCustomAlerts: true,
  enableStyleImprovements: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (e) {
      console.error("Moocs Sharp: Failed to load settings.", e);
    }
  }, []);

  const saveSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    } catch (e) {
      console.error("Moocs Sharp: Failed to save settings.", e);
    }
  };

  return { settings, saveSettings };
};