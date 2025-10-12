import { useEffect, useState } from "react";

import { StorageManager, type ScheduleHistory } from "../../utils/storage";

export const useScheduleHistory = () => {
  const [history, setHistory] = useState<ScheduleHistory>({
    subjects: [],
    teachers: [],
    rooms: [],
  });

  useEffect(() => {
    const loadHistory = async () => {
      const savedHistory = await StorageManager.getHistory();
      const extractedSubjects = await StorageManager.getExtractedSubjects();

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
    const unwatchSubjects = StorageManager.watchExtractedSubjects(() => {
      loadHistory();
    });

    const unwatchHistory = StorageManager.watchHistory(() => {
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
    await StorageManager.addToHistory(subject, teacher, room);

    // ローカルステートを更新
    const updatedHistory = await StorageManager.getHistory();
    const extractedSubjects = await StorageManager.getExtractedSubjects();
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
