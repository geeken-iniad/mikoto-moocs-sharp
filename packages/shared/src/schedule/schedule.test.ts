import { describe, expect, it } from "vitest";
import {
  createTermInfo,
  createTimeSlotKey,
  formatTermInfo,
  getCampusLabel,
  parseTermString,
  parseTimeSlotKey,
} from "./index";

describe("schedule domain helpers", () => {
  describe("time slot keys", () => {
    it("creates and parses valid weekday-period keys", () => {
      const key = createTimeSlotKey("Mon", 1);

      expect(key).toBe("Mon-1");
      expect(parseTimeSlotKey(key)).toEqual({ weekday: "Mon", period: 1 });
      expect(parseTimeSlotKey("Sat-7")).toEqual({
        weekday: "Sat",
        period: 7,
      });
    });

    it("rejects malformed or out-of-range time slot keys", () => {
      expect(parseTimeSlotKey("Sun-1" as never)).toBeNull();
      expect(parseTimeSlotKey("Mon-0" as never)).toBeNull();
      expect(parseTimeSlotKey("Mon-8" as never)).toBeNull();
      expect(parseTimeSlotKey("Mon" as never)).toBeNull();
    });
  });

  describe("term helpers", () => {
    it("formats semester and quarter terms", () => {
      expect(formatTermInfo(2026, createTermInfo("Spring", 1))).toBe(
        "2026春学期1Q",
      );
      expect(formatTermInfo(2026, createTermInfo("Fall", "Semester"))).toBe(
        "2026秋学期",
      );
    });

    it("parses valid term strings", () => {
      expect(parseTermString("2026春学期2Q")).toEqual({
        academicYear: 2026,
        termInfo: { semester: "Spring", division: 2 },
      });
      expect(parseTermString("2026秋学期")).toEqual({
        academicYear: 2026,
        termInfo: { semester: "Fall", division: "Semester" },
      });
    });

    it("rejects invalid semester and quarter combinations", () => {
      expect(() => createTermInfo("Spring", 3)).toThrow(
        "Invalid term combination",
      );
      expect(parseTermString("2026春学期3Q")).toBeNull();
      expect(parseTermString("2026秋学期2Q")).toBeNull();
      expect(parseTermString("2026冬学期")).toBeNull();
    });
  });

  it("resolves campus labels from schedule constants", () => {
    expect(getCampusLabel("akabanedai")).toBe("赤羽台");
  });
});
