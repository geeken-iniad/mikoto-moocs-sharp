import type { ScheduleStore, KeyboardShortcutSettings } from "../types";
import type { IStorageAdapter } from "./interface";

/**
 * ストレージキー定数
 */
export const STORAGE_KEYS = {
  SCHEDULE_STORE: "mikoto-schedule-store",
  SUBJECTS: "mikoto-extracted-subjects",
  DUAL_VIEW: "mikoto-dual-view",
  THEME: "mikoto-theme",
  KEYBOARD_SHORTCUTS: "mikoto-keyboard-shortcuts",
} as const;

/**
 * ストレージ管理クラス
 * プラットフォーム非依存のストレージ操作を提供
 */
export class StorageManager {
  constructor(private adapter: IStorageAdapter) {}

  // ========================================
  // スケジュール関連
  // ========================================

  async getScheduleStore(): Promise<ScheduleStore> {
    const result = await this.adapter.getItem<ScheduleStore>(
      STORAGE_KEYS.SCHEDULE_STORE,
    );
    return (
      result || {
        schemaVersion: 1,
        courses: {},
        schedules: {},
      }
    );
  }

  async saveScheduleStore(store: ScheduleStore): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.SCHEDULE_STORE, store);
  }

  watchScheduleStore(callback: (newStore: ScheduleStore | null) => void) {
    return this.adapter.watch<ScheduleStore>(
      STORAGE_KEYS.SCHEDULE_STORE,
      callback,
    );
  }

  // ========================================
  // 抽出された科目関連
  // ========================================

  async getExtractedSubjects(): Promise<string[]> {
    const result = await this.adapter.getItem<string[]>(STORAGE_KEYS.SUBJECTS);
    return result || [];
  }

  async saveExtractedSubjects(subjects: string[]): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.SUBJECTS, subjects);
  }

  async addExtractedSubjects(newSubjects: string[]): Promise<void> {
    const existingSubjects = await this.getExtractedSubjects();
    const mergedSubjects = [
      ...new Set([...existingSubjects, ...newSubjects]),
    ].sort();
    await this.saveExtractedSubjects(mergedSubjects);
  }

  watchExtractedSubjects(callback: (subjects: string[] | null) => void) {
    return this.adapter.watch<string[]>(STORAGE_KEYS.SUBJECTS, callback);
  }

  // ========================================
  // 設定関連
  // ========================================

  async getDualView(): Promise<boolean> {
    const result = await this.adapter.getItem<boolean>(STORAGE_KEYS.DUAL_VIEW);
    return result || false;
  }

  async setDualView(enabled: boolean): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.DUAL_VIEW, enabled);
  }

  watchDualView(callback: (enabled: boolean | null) => void) {
    return this.adapter.watch<boolean>(STORAGE_KEYS.DUAL_VIEW, callback);
  }

  async getTheme(): Promise<"light" | "dark"> {
    const result = await this.adapter.getItem<"light" | "dark">(
      STORAGE_KEYS.THEME,
    );
    return result || "light";
  }

  async setTheme(theme: "light" | "dark"): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.THEME, theme);
  }

  watchTheme(callback: (theme: "light" | "dark" | null) => void) {
    return this.adapter.watch<"light" | "dark">(STORAGE_KEYS.THEME, callback);
  }

  async getKeyboardShortcuts(): Promise<KeyboardShortcutSettings> {
    const result = await this.adapter.getItem<KeyboardShortcutSettings>(
      STORAGE_KEYS.KEYBOARD_SHORTCUTS,
    );
    return (
      result || {
        submitShortcut: false,
        numberKeyShortcut: false,
        arrowKeyShortcut: false,
      }
    );
  }

  async setKeyboardShortcuts(
    settings: KeyboardShortcutSettings,
  ): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.KEYBOARD_SHORTCUTS, settings);
  }

  watchKeyboardShortcuts(
    callback: (settings: KeyboardShortcutSettings | null) => void,
  ) {
    return this.adapter.watch<KeyboardShortcutSettings>(
      STORAGE_KEYS.KEYBOARD_SHORTCUTS,
      callback,
    );
  }
}
