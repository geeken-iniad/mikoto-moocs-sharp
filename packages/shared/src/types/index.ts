// Character Counter Types
export type CharacterCountMode = "normal" | "no-newlines" | "no-whitespace";

export interface CharacterCounterProps {
  value: string;
}

export interface ExtendedHTMLTextAreaElement extends HTMLTextAreaElement {
  __mikotoCleanup?: () => void;
}

export type * from "../schedule/types";
export type * from "../settings/types";
