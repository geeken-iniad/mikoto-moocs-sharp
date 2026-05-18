export * from "../schedule/constants";

// App Config
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

// MOOCs URL
export const MOOCS_URL = "https://moocs.iniad.org";

// Z-Index Constants
export const Z_INDEX = {
  SETTINGS_MODAL: 100000,
  SIDEBAR_DECK: 4,
} as const;
