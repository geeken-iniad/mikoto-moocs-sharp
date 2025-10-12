import { useEffect, useState } from "react";

import type { StorageManager, ScheduleHistory } from "../../storage/manager";

export const createUseScheduleHistory = (storageManager: StorageManager) => {
  return () => {
    const [history, setHistory] = useState<ScheduleHistory>({
      subjects: [],
      teachers: [],
      rooms: [],
    });

    useEffect(() => {
      const loadHistory = async () => {
        const savedHistory = await storageManager.getHistory();
        const extractedSubjects = await storageManager.getExtractedSubjects();

        // 抽出された科目と保存された履歴をマージ
        const mergedSubjects = [
          ...new Set([...savedHistory.subjects, ...extractedSubjects]),
        ].sort();

        setHistory({
          ...savedHistory,
          subjects: mergedSubjects,
        });
      };
      loadHistory();

      // ストレージの変更を監視
      const unwatchSubjects = storageManager.watchExtractedSubjects(() => {
        loadHistory();
      });

      const unwatchHistory = storageManager.watchHistory(() => {
        loadHistory();
      });

      return () => {
        unwatchSubjects();
        unwatchHistory();
      };
    }, []);

    const addToHistory = async (
      subject?: string,
      teacher?: string,
      room?: string,
    ) => {
      await storageManager.addToHistory(subject, teacher, room);

      // ローカルステートを更新
      const updatedHistory = await storageManager.getHistory();
      const extractedSubjects = await storageManager.getExtractedSubjects();
      const mergedSubjects = [
        ...new Set([...updatedHistory.subjects, ...extractedSubjects]),
      ].sort();

      setHistory({
        ...updatedHistory,
        subjects: mergedSubjects,
      });
    };

    return {
      history,
      addToHistory,
    };
  };
};

// デフォルトエクスポート用（extension内で使用）
export const useScheduleHistory = (storageManager: StorageManager) =>
  createUseScheduleHistory(storageManager)();
