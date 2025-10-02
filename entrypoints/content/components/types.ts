export type CharacterCountMode = "normal" | "no-newlines" | "no-whitespace";

export interface CharacterCounterProps {
  value: string;
}

export interface FooterCreditProps {
  appUrl: string;
}

export interface ExtendedHTMLTextAreaElement extends HTMLTextAreaElement {
  __mikotoCleanup?: () => void;
}
