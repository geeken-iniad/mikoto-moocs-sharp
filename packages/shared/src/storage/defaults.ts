import type {
  CampusSettings,
  KeyboardShortcutSettings,
  NotificationSettings,
  ScheduleStore,
  Theme,
} from "../types";

export function createDefaultScheduleStore(): ScheduleStore {
  return {
    schemaVersion: 1,
    courses: {},
    schedules: {},
    instructors: [],
  };
}

export function createDefaultExtractedSubjects(): string[] {
  return [];
}

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

export function mergeUniqueSortedStrings(
  existingValues: string[],
  newValues: string[],
): string[] {
  return [...new Set([...existingValues, ...newValues])].sort();
}
