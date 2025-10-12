import { useEffect, useState } from "react";

import {
  HISTORY_STORAGE_KEY,
  SUBJECTS_STORAGE_KEY,
} from "../components/constants";

export interface ScheduleHistory {
  subjects: string[];
  teachers: string[];
  rooms: string[];
}

export const useScheduleHistory = () => {
  const [history, setHistory] = useState<ScheduleHistory>({
    subjects: [],
    teachers: [],
    rooms: [],
  });

  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await storage.getItem<ScheduleHistory>(
        `local:${HISTORY_STORAGE_KEY}`,
      );
      const extractedSubjects = await storage.getItem<string[]>(
        `local:${SUBJECTS_STORAGE_KEY}`,
      );

      const historyData = savedHistory || {
        subjects: [],
        teachers: [],
        rooms: [],
      };
      const subjectsData = extractedSubjects || [];

      // 抽出された科目と保存された履歴をマージ
      const mergedSubjects = [
        ...new Set([...historyData.subjects, ...subjectsData]),
      ].sort();

      setHistory({
        ...historyData,
        subjects: mergedSubjects,
      });
    };
    loadHistory();

    // ストレージの変更を監視
    const unwatch = storage.watch<string[]>(
      `local:${SUBJECTS_STORAGE_KEY}`,
      () => {
        loadHistory();
      },
    );

    const unwatchHistory = storage.watch<ScheduleHistory>(
      `local:${HISTORY_STORAGE_KEY}`,
      () => {
        loadHistory();
      },
    );

    return () => {
      unwatch();
      unwatchHistory();
    };
  }, []);

  const addToHistory = async (
    subject?: string,
    teacher?: string,
    room?: string,
  ) => {
    const newHistory = { ...history };

    if (subject && subject.trim() && !newHistory.subjects.includes(subject)) {
      newHistory.subjects = [...newHistory.subjects, subject];
    }
    if (teacher && teacher.trim() && !newHistory.teachers.includes(teacher)) {
      newHistory.teachers = [...newHistory.teachers, teacher];
    }
    if (room && room.trim() && !newHistory.rooms.includes(room)) {
      newHistory.rooms = [...newHistory.rooms, room];
    }

    setHistory(newHistory);
    await storage.setItem(`local:${HISTORY_STORAGE_KEY}`, newHistory);
  };

  return {
    history,
    addToHistory,
  };
};
