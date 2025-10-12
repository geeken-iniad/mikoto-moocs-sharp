import type { DayOfWeek } from "../types";

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

// Schedule Constants
export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "月",
  tuesday: "火",
  wednesday: "水",
  thursday: "木",
  friday: "金",
  saturday: "土",
};

export const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const PERIODS = [
  { label: "1限", start: "09:00", end: "10:30" },
  { label: "2限", start: "10:40", end: "12:10" },
  { label: "3限", start: "13:00", end: "14:30" },
  { label: "4限", start: "14:45", end: "16:15" },
  { label: "5限", start: "16:30", end: "18:00" },
  { label: "6限", start: "18:15", end: "19:45" },
];

// Storage Keys
export const STORAGE_KEY = "mikoto-schedule";
export const HISTORY_STORAGE_KEY = "mikoto-schedule-history";
export const SUBJECTS_STORAGE_KEY = "mikoto-extracted-subjects";

// MOOCs URL
export const MOOCS_URL = "https://moocs.iniad.org";
