import { describe, expect, it } from "vitest";
import { containsKeywords, countCharacters } from "../text";

describe("containsKeywords", () => {
  it("returns true when text contains a keyword", () => {
    expect(containsKeywords("出席確認", ["出席", "出欠"])).toBe(true);
  });

  it("returns false when text contains no keywords", () => {
    expect(containsKeywords("授業資料", ["出席", "課題"])).toBe(false);
  });

  it("returns false for empty keywords", () => {
    expect(containsKeywords("出席", [])).toBe(false);
  });

  it("returns false for empty text", () => {
    expect(containsKeywords("", ["出席"])).toBe(false);
  });
});

describe("countCharacters", () => {
  it("counts ASCII characters", () => {
    expect(countCharacters("hello")).toBe(5);
  });

  it("counts Japanese characters", () => {
    expect(countCharacters("こんにちは")).toBe(5);
  });

  it("counts emoji correctly (grapheme clusters)", () => {
    // Family emoji is a single grapheme
    expect(countCharacters("👨‍👩‍👧‍👦")).toBe(1);
  });

  it("handles empty string", () => {
    expect(countCharacters("")).toBe(0);
    expect(countCharacters()).toBe(0);
  });

  it("no-newlines mode removes newlines", () => {
    expect(countCharacters("a\nb\nc", "no-newlines")).toBe(3);
    expect(countCharacters("a\r\nb", "no-newlines")).toBe(2);
  });

  it("no-whitespace mode removes all whitespace", () => {
    expect(countCharacters("a b c", "no-whitespace")).toBe(3);
    // Full-width space
    expect(countCharacters("あ\u3000い", "no-whitespace")).toBe(2);
  });

  it("normal mode preserves everything", () => {
    expect(countCharacters("a b\nc", "normal")).toBe(5);
  });
});
