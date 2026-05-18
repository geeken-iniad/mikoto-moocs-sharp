import type { ScheduleStore } from "../types";

export {
  createDefaultCampusSettings,
  createDefaultDualView,
  createDefaultKeyboardShortcuts,
  createDefaultNotificationSettings,
  createDefaultSlideEnhancerEnabled,
  createDefaultTheme,
} from "../settings/defaults";

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

export function mergeUniqueSortedStrings(
  existingValues: string[],
  newValues: string[],
): string[] {
  return [...new Set([...existingValues, ...newValues])].sort();
}
