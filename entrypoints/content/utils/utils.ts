import type { CharacterCountMode } from "./types";

const NEWLINE_PATTERN = /[\r\n]+/g;
const WHITESPACE_PATTERN = /[\s\u3000]+/g;

/**
 * テキストに指定されたキーワードが含まれているかをチェック
 */
export const containsKeywords = (
  text: string,
  keywords: readonly string[],
): boolean => {
  return keywords.some((keyword) => text.includes(keyword));
};

/**
 * モードに応じてテキストを変換
 */
const transformTextByMode = (
  text: string,
  mode: CharacterCountMode,
): string => {
  switch (mode) {
    case "no-newlines":
      return text.replace(NEWLINE_PATTERN, "");
    case "no-whitespace":
      return text.replace(WHITESPACE_PATTERN, "");
    case "normal":
    default:
      return text;
  }
};

/**
 * Intl.Segmenterを使用して正確に文字数をカウント
 * サロゲートペアや結合文字を考慮
 */
const countWithSegmenter = (text: string): number => {
  return Array.from(
    new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text),
  ).length;
};

/**
 * スプレッド演算子を使用した簡易的な文字数カウント
 * フォールバック用
 */
const countWithSpread = (text: string): number => {
  return [...text].length;
};

/**
 * テキストの文字数をカウント
 * モードに応じて改行や空白を除外可能
 */
export const countCharacters = (
  text = "",
  mode: CharacterCountMode = "normal",
): number => {
  const modifiedText = transformTextByMode(text, mode);

  return typeof Intl !== "undefined" && Intl.Segmenter
    ? countWithSegmenter(modifiedText)
    : countWithSpread(modifiedText);
};

/**
 * HTML要素にスタイルを適用
 */
export const applyStyles = (
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration> | Record<string, string>,
): void => {
  Object.assign(element.style, styles);
};

/**
 * 後方互換性のためのユーティリティオブジェクト
 * @deprecated 個別の関数を直接インポートすることを推奨
 */
export const utils = {
  containsKeywords,
  countCharacters,
  applyStyles,
} as const;
