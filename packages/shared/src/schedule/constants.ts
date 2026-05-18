import type {
  CampusId,
  Period,
  Semester,
  TermDivision,
  Weekday,
} from "./types";

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

export const VALID_TERM_DIVISIONS: Record<Semester, TermDivision[]> = {
  Spring: ["Semester", 1, 2],
  Fall: ["Semester", 3, 4],
};

export const SEMESTER_LABELS: Record<Semester, string> = {
  Spring: "春学期",
  Fall: "秋学期",
};

export const CAMPUS_LABELS: Record<CampusId, string> = {
  akabanedai: "赤羽台",
  asaka: "朝霞",
  kawagoe: "川越",
  hakusan: "白山",
};

export const DELIVERY_MODE_LABELS = {
  "face-to-face": "対面",
  online: "オンライン",
  "on-demand": "オンデマンド",
  "online-on-demand": "非対面+オンデマンド",
} as const;

export const ROOM_TYPE_LABELS = {
  physical: "対面教室",
  online: "オンライン",
  "on-demand": "オンデマンド",
} as const;

export const EXCEPTION_TYPE_LABELS = {
  "delivery-mode-change": "授業形態変更",
  cancellation: "休講",
  makeup: "補講",
  "room-change": "教室変更",
  other: "その他",
} as const;
