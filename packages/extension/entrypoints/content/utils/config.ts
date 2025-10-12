export const CONFIG = {
  APP_WEBSITE_URL: "https://github.com/med0rei/mikoto-moocs-sharp",
  DEVELOPER_WEBSITE_URL: "https://github.com/med0rei",
  WORDS: {
    attendances: ["出席", "出欠", "確認"],
    assignments: ["課題", "quiz", "クイズ", "report", "レポート"],
  },
  STYLES: {
    attendance: {
      backgroundColor: "red",
      color: "white",
    },
    assignment: {
      backgroundColor: "aqua",
      color: "black",
    },
    activeBorder: "2px solid black",
  },
} as const;
