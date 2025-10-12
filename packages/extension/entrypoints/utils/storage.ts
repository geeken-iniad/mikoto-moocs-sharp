import type { Schedule } from "@mikoto-moocs-sharp/shared";
import {
  HISTORY_STORAGE_KEY,
  STORAGE_KEY,
  SUBJECTS_STORAGE_KEY,
} from "@mikoto-moocs-sharp/shared";

export interface ScheduleHistory {
  subjects: string[];
  teachers: string[];
  rooms: string[];
}

/**
 * ストレージ管理クラス
 * 拡張機能全体で使用するストレージアクセスを一元管理
 */
export class StorageManager {
  // ========================================
  // スケジュール関連
  // ========================================

  /**
   * スケジュールを取得
   */
  static async getSchedule(): Promise<Schedule> {
    const result = await storage.getItem<Schedule>(`local:${STORAGE_KEY}`);
    return result || {};
  }

  /**
   * スケジュールを保存
   */
  static async saveSchedule(schedule: Schedule): Promise<void> {
    await storage.setItem(`local:${STORAGE_KEY}`, schedule);
  }

  /**
   * スケジュールの変更を監視
   */
  static watchSchedule(callback: (newSchedule: Schedule | null) => void) {
    return storage.watch<Schedule>(`local:${STORAGE_KEY}`, callback);
  }

  // ========================================
  // スケジュール履歴関連
  // ========================================

  /**
   * スケジュール履歴を取得
   */
  static async getHistory(): Promise<ScheduleHistory> {
    const result = await storage.getItem<ScheduleHistory>(
      `local:${HISTORY_STORAGE_KEY}`,
    );
    return (
      result || {
        subjects: [],
        teachers: [],
        rooms: [],
      }
    );
  }

  /**
   * スケジュール履歴を保存
   */
  static async saveHistory(history: ScheduleHistory): Promise<void> {
    await storage.setItem(`local:${HISTORY_STORAGE_KEY}`, history);
  }

  /**
   * スケジュール履歴に項目を追加
   */
  static async addToHistory(
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

  /**
   * スケジュール履歴の変更を監視
   */
  static watchHistory(
    callback: (newHistory: ScheduleHistory | null) => void,
  ) {
    return storage.watch<ScheduleHistory>(
      `local:${HISTORY_STORAGE_KEY}`,
      callback,
    );
  }

  // ========================================
  // 抽出された科目関連
  // ========================================

  /**
   * 抽出された科目リストを取得
   */
  static async getExtractedSubjects(): Promise<string[]> {
    const result = await storage.getItem<string[]>(
      `local:${SUBJECTS_STORAGE_KEY}`,
    );
    return result || [];
  }

  /**
   * 抽出された科目リストを保存
   */
  static async saveExtractedSubjects(subjects: string[]): Promise<void> {
    await storage.setItem(`local:${SUBJECTS_STORAGE_KEY}`, subjects);
  }

  /**
   * 抽出された科目を追加（重複を除いてマージ）
   */
  static async addExtractedSubjects(newSubjects: string[]): Promise<void> {
    const existingSubjects = await this.getExtractedSubjects();
    const mergedSubjects = [
      ...new Set([...existingSubjects, ...newSubjects]),
    ].sort();
    await this.saveExtractedSubjects(mergedSubjects);
  }

  /**
   * 抽出された科目リストの変更を監視
   */
  static watchExtractedSubjects(callback: (subjects: string[] | null) => void) {
    return storage.watch<string[]>(`local:${SUBJECTS_STORAGE_KEY}`, callback);
  }
}
