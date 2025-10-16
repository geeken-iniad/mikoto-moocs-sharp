// Character Counter Types
export type CharacterCountMode = "normal" | "no-newlines" | "no-whitespace";

export interface CharacterCounterProps {
  value: string;
}

export interface ExtendedHTMLTextAreaElement extends HTMLTextAreaElement {
  __mikotoCleanup?: () => void;
}

// Schedule Types
export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface Period {
  start: string;
  end: string;
}

export interface Class {
  subject: string;
  teacher?: string;
  room?: string;
  period: Period;
}

export type Schedule = {
  [key in DayOfWeek]?: Class[];
};

// Schedule Editor Types
export interface EditingCell {
  day: DayOfWeek;
  periodIndex: number;
}

// Theme Types
export type Theme = "light" | "dark";
