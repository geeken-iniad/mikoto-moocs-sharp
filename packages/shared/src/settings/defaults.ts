import type {
  CampusSettings,
  KeyboardShortcutSettings,
  NotificationSettings,
  Theme,
} from "./types";

export function createDefaultDualView(): boolean {
  return false;
}

export function createDefaultSlideEnhancerEnabled(): boolean {
  return false;
}

export function createDefaultTheme(): Theme {
  return "light";
}

export function createDefaultKeyboardShortcuts(): KeyboardShortcutSettings {
  return {
    submitShortcut: false,
    numberKeyShortcut: false,
    arrowKeyShortcut: false,
  };
}

export function createDefaultCampusSettings(): CampusSettings {
  return {};
}

export function createDefaultNotificationSettings(): NotificationSettings {
  return { enabled: false, timings: [-10] };
}
