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
export type TimeSlotKey = `${Weekday}-${Period}`;
type SlotId = UUID;

export type CampusId = "akabanedai" | "asaka" | "kawagoe" | "hakusan";

// 授業形態
export type DeliveryMode =
  | "face-to-face"
  | "online"
  | "on-demand"
  | "online-on-demand";

// 教室種別
export type RoomType = "physical" | "online" | "on-demand";

export interface Room {
  type: RoomType;
  campus?: CampusId; // physical の場合に指定
  building?: string; // physical の場合に指定
  number: string; // physical: 教室番号（"A-402"）、online/on-demand: プラットフォーム名（"Zoom", "Teams"等）
  note?: string; // 実験室/PC室 等
}

export interface CourseUrls {
  moocs?: string;
  classroom?: string;
  toyonetAce?: string;
  slack?: string;
  syllabus?: string;
  other?: Array<{ label: string; url: string }>;
}

// 科目（恒久情報）
export interface Course {
  id: UUID;
  code?: string;
  name: string;
  instructors: string[];
  urls?: CourseUrls;
  defaultRooms?: Room[];
}

// 授業スロット（学期ごとの通常状態）
export interface ScheduleSlot {
  id: SlotId;
  courseId: UUID;
  rooms?: Room[]; // Course.defaultRooms を完全置換
  defaultDeliveryMode?: DeliveryMode; // 未指定の場合は face-to-face
  memo?: string; // 学期全体の特記事項
  color?: string; // 表示色
  customInstructors?: string[]; // 担当教員の上書き
}

// 例外種別
export type ExceptionType =
  | "delivery-mode-change" // 授業形態変更
  | "cancellation" // 休講
  | "makeup" // 補講
  | "room-change" // 教室変更
  | "other"; // その他

// 補講情報
export interface MakeupInfo {
  originalDate: string; // ISO 8601形式
  makeupDate: string; // ISO 8601形式
  makeupTimeSlotKey?: TimeSlotKey; // 振替先の時限
  makeupRooms?: Room[]; // 振替先の教室
}

// 特例（特定日付の差分）
export interface ExceptionEntry {
  id: UUID;
  slotId: SlotId;
  date: string; // ISO 8601形式（例: "2025-04-15"）
  type: ExceptionType;
  changedDeliveryMode?: DeliveryMode; // 授業形態変更の場合
  changedRooms?: Room[]; // 教室変更の場合
  makeupInfo?: MakeupInfo; // 補講の場合
  memo?: string; // 例外の詳細説明
}

export type Semester = "Spring" | "Fall";
export type Quarter = 1 | 2 | 3 | 4;
export type TermDivision = "Semester" | Quarter;

export interface TermInfo {
  semester: Semester;
  division: TermDivision;
}

// 時間割（学期ごと）
export interface Schedule {
  id: UUID;
  academicYear: number;
  term: TermInfo;
  grid: Partial<Record<TimeSlotKey, SlotId>>; // セル配置
  slots: Record<SlotId, ScheduleSlot>; // 実体辞書
  exceptions: Record<string, ExceptionEntry[]>; // 日付 → 例外の配列
}

// ストレージ全体
export interface ScheduleStore {
  schemaVersion: number;
  courses: Record<UUID, Course>;
  schedules: Record<UUID, Schedule>;
  instructors?: string[]; // 教員名リスト
}

// 整合性検証エラー
export interface ValidationError {
  scheduleId?: UUID;
  message: string;
}

// Theme Types
export type Theme = "light" | "dark";

// Keyboard Shortcuts Types
export interface KeyboardShortcutSettings {
  submitShortcut: boolean; // Ctrl/Cmd+Enter でフォーム提出
  numberKeyShortcut: boolean; // 数字キー (1-9) でページネーション
  arrowKeyShortcut: boolean; // Shift+左右矢印 でページ移動
}

// Campus Settings Types
export interface CampusSettings {
  defaultCampus?: CampusId; // デフォルトキャンパス
}

// Notification Settings Types
export interface NotificationSettings {
  enabled: boolean; // 通知機能のオンオフ
  timings: number[]; // 通知を送る時刻(分単位、負の数で「何分前」を表現。例: [-30, -10])
}
