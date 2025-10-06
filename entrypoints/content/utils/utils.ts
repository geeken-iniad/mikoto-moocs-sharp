import type { CharacterCountMode } from "./types";

export const utils = {
  containsKeywords(text: string, keywords: readonly string[]): boolean {
    return keywords.some((keyword) => text.includes(keyword));
  },

  countCharacters(text = "", mode: CharacterCountMode = "normal"): number {
    const modifiedText = (() => {
      switch (mode) {
        case "normal":
          return text;
        case "no-newlines":
          return text.replace(/[\r\n]+/g, "");
        case "no-whitespace":
          return text.replace(/[\s\u3000]+/g, "");
        default:
          return text;
      }
    })();

    return Intl
      ? Array.from(
          new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
            modifiedText,
          ),
        ).length
      : [...modifiedText].length;
  },

  applyStyles(element: HTMLElement, styles: Record<string, string>): void {
    Object.assign(element.style, styles);
  },
} as const;
