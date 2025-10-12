const SUBJECTS_STORAGE_KEY = "mikoto-extracted-subjects";

export const extractAndSaveSubjects = async () => {
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
    // 既存の科目リストを取得
    const result = await browser.storage.local.get(SUBJECTS_STORAGE_KEY);
    const existingSubjects = result[SUBJECTS_STORAGE_KEY] || [];

    // 重複を除いてマージ
    const mergedSubjects = [
      ...new Set([...existingSubjects, ...subjects]),
    ].sort();

    // 保存
    await browser.storage.local.set({
      [SUBJECTS_STORAGE_KEY]: mergedSubjects,
    });
  }
};
