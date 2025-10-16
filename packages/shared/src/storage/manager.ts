import type { Schedule } from "../types";
import type { IStorageAdapter } from "./interface";

export interface ScheduleHistory {
  subjects: string[];
  teachers: string[];
  rooms: string[];
}

/**
 * ストレージキー定数
 */
export const STORAGE_KEYS = {
  SCHEDULE: "mikoto-schedule",
  HISTORY: "mikoto-schedule-history",
  SUBJECTS: "mikoto-extracted-subjects",
  DUAL_VIEW: "mikoto-dual-view",
  THEME: "mikoto-theme",
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

  async getSchedule(): Promise<Schedule> {
    const result = await this.adapter.getItem<Schedule>(STORAGE_KEYS.SCHEDULE);
    return result || {};
  }

  async saveSchedule(schedule: Schedule): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.SCHEDULE, schedule);
  }

  watchSchedule(callback: (newSchedule: Schedule | null) => void) {
    return this.adapter.watch<Schedule>(STORAGE_KEYS.SCHEDULE, callback);
  }

  // ========================================
  // スケジュール履歴関連
  // ========================================

  async getHistory(): Promise<ScheduleHistory> {
    const result = await this.adapter.getItem<ScheduleHistory>(
      STORAGE_KEYS.HISTORY,
    );
    return (
      result || {
        subjects: [],
        teachers: [],
        rooms: [],
      }
    );
  }

  async saveHistory(history: ScheduleHistory): Promise<void> {
    await this.adapter.setItem(STORAGE_KEYS.HISTORY, history);
  }

  async addToHistory(
    subject?: string,
    teacher?: string,
    room?: string,
  ): Promise<void> {
    const history = await this.getHistory();

    if (subject && subject.trim() && !history.subjects.includes(subject)) {
      history.subjects = [...history.subjects, subject];
    }
    if (teacher && teacher.trim() && !history.teachers.includes(teacher)) {
      history.teachers = [...history.teachers, teacher];
    }
    if (room && room.trim() && !history.rooms.includes(room)) {
      history.rooms = [...history.rooms, room];
    }

    await this.saveHistory(history);
  }

  watchHistory(callback: (newHistory: ScheduleHistory | null) => void) {
    return this.adapter.watch<ScheduleHistory>(STORAGE_KEYS.HISTORY, callback);
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
}
