import type { Weekday, Period, CampusId, Semester, TermDivision } from "../types";

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
export const DAY_LABELS: Record<Weekday, string> = {
  Mon: "月",
  Tue: "火",
  Wed: "水",
  Thu: "木",
  Fri: "金",
  Sat: "土",
};

export const DAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const PERIODS: Record<
  Period,
  { label: string; start: string; end: string }
> = {
  1: { label: "1限", start: "09:00", end: "10:30" },
  2: { label: "2限", start: "10:40", end: "12:10" },
  3: { label: "3限", start: "13:00", end: "14:30" },
  4: { label: "4限", start: "14:45", end: "16:15" },
  5: { label: "5限", start: "16:30", end: "18:00" },
  6: { label: "6限", start: "18:15", end: "19:45" },
  7: { label: "7限", start: "20:00", end: "21:30" },
};

// MOOCs URL
export const MOOCS_URL = "https://moocs.iniad.org";

// Term Constants
export const VALID_TERM_DIVISIONS: Record<Semester, TermDivision[]> = {
  Spring: ["Semester", 1, 2],
  Fall: ["Semester", 3, 4],
};

export const SEMESTER_LABELS: Record<Semester, string> = {
  Spring: "春学期",
  Fall: "秋学期",
};

// Campus Constants
export const CAMPUS_LABELS: Record<CampusId, string> = {
  akabanedai: "赤羽台",
  asaka: "朝霞",
  kawagoe: "川越",
  hakusan: "白山",
};

// Z-Index Constants
export const Z_INDEX = {
  SETTINGS_MODAL: 100000,
  SIDEBAR_DECK: 4,
} as const;
