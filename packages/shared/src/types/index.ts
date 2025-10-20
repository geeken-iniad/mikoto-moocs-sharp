// Character Counter Types
export type CharacterCountMode = "normal" | "no-newlines" | "no-whitespace";

export interface CharacterCounterProps {
  value: string;
}

export interface ExtendedHTMLTextAreaElement extends HTMLTextAreaElement {
  __mikotoCleanup?: () => void;
}

// Schedule Types
type UUID = string;
export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
export type Period = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type CampusId = "akabanedai" | "asaka" | "kawagoe" | "hakusan";

export interface Room {
  campus?: CampusId;
  building?: string;
  number: string; // "A-402" など
  note?: string; // 実験室/PC室 等
}

export interface CourseUrls {
  syllabus?: string;
  moocs?: string;
  toyonet?: string;
  slack?: string;
  other?: Array<{ label: string; url: string }>;
}

export interface Course {
  // 旧Class
  id: UUID;
  code?: string; // シラバスの科目コード等
  name: string;
  instructors: string[]; // 複数OK
  urls?: CourseUrls;
  // 部分的に曜日で部屋が分かれるなら offering 側で上書きもできる
  defaultRooms?: Room[]; // 共通の部屋(なければ offering.rooms を使う)
}

export interface Offering {
  // 開講(曜日×時限)
  id: UUID;
  courseId: UUID;
  weekday: Weekday;
  period: Period;
  rooms?: Room[]; // ここで曜日別の部屋を指定
}

export type Semester = "Spring" | "Fall";
export type Quarter = 1 | 2 | 3 | 4;
export type TermDivision = "Semester" | Quarter;

export interface TermInfo {
  semester: Semester;
  division: TermDivision;
}

export interface Schedule {
  // 年度×学期の時間割
  id: UUID;
  academicYear: number; // 2025 など
  term: TermInfo;
  offeringIds: UUID[]; // その学期で有効な Offering 群
}

export interface ScheduleStore {
  courses: Record<UUID, Course>;
  offerings: Record<UUID, Offering>;
  schedules: Record<UUID, Schedule>;
}

// Theme Types
export type Theme = "light" | "dark";

// Keyboard Shortcuts Types
export interface KeyboardShortcutSettings {
  submitShortcut: boolean; // Ctrl/Cmd+Enter でフォーム提出
  numberKeyShortcut: boolean; // 数字キー (1-9) でページネーション
  arrowKeyShortcut: boolean; // Shift+左右矢印 でページ移動
}
