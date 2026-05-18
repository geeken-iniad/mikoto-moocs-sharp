import type { CampusId } from "../schedule/types";

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
