import type { StorageManager } from "../storage/manager";

/**
 * ページから科目名を抽出してストレージに保存
 */
export const createSubjectExtractor = (storageManager: StorageManager) => {
  return async () => {
    const wells = document.querySelectorAll(".well");
    const subjects: string[] = [];

    wells.forEach((well) => {
      // wellの中から科目名を抽出
      const titleElement =
        well.querySelector("h4") || well.querySelector("a.btn-primary");
      if (titleElement) {
        const subject = titleElement.textContent?.trim();
        if (subject && !subjects.includes(subject)) {
          subjects.push(subject);
        }
      }
    });

    if (subjects.length > 0) {
      // StorageManagerを使って科目を追加
      await storageManager.addExtractedSubjects(subjects);
    }
  };
};
