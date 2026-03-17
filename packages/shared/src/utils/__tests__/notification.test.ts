import { describe, expect, it } from "vitest";
import type {
  Course,
  Schedule,
  ScheduleSlot,
  ScheduleStore,
  TimeSlotKey,
} from "../../types";
import type { NextClass } from "../notification";
import {
  createNotificationMessage,
  getNextClass,
  shouldNotify,
} from "../notification";
import { createTermInfo } from "../schedule";

// ========================================
// Helpers
// ========================================

function makeTestStore(): {
  store: ScheduleStore;
  scheduleId: string;
} {
  const course: Course = {
    id: "course-1",
    name: "プログラミング入門",
    instructors: ["山田太郎"],
  };

  const slot: ScheduleSlot = {
    id: "slot-1",
    courseId: "course-1",
  };

  const schedule: Schedule = {
    id: "schedule-1",
    academicYear: 2025,
    term: createTermInfo("Spring", "Semester"),
    grid: {
      "Mon-1": "slot-1",
      "Wed-3": "slot-1",
    } as Partial<Record<TimeSlotKey, string>>,
    slots: { "slot-1": slot },
    exceptions: {},
  };

  const store: ScheduleStore = {
    schemaVersion: 1,
    courses: { "course-1": course },
    schedules: { "schedule-1": schedule },
  };

  return { store, scheduleId: "schedule-1" };
}

// ========================================
// getNextClass
// ========================================

describe("getNextClass", () => {
  it("returns null for non-existent schedule", () => {
    const { store } = makeTestStore();
    expect(getNextClass(store, "fake-id")).toBeNull();
  });

  it("returns null on Sunday", () => {
    const { store, scheduleId } = makeTestStore();
    // 2025-03-16 is a Sunday
    const sunday = new Date(2025, 2, 16, 10, 0, 0);
    expect(getNextClass(store, scheduleId, sunday)).toBeNull();
  });

  it("returns next class on same day if before start time", () => {
    const { store, scheduleId } = makeTestStore();
    // 2025-03-17 is Monday, before 09:00 (period 1)
    const monday8am = new Date(2025, 2, 17, 8, 0, 0);
    const result = getNextClass(store, scheduleId, monday8am);
    expect(result).not.toBeNull();
    expect(result?.weekday).toBe("Mon");
    expect(result?.period).toBe(1);
    expect(result?.course.name).toBe("プログラミング入門");
  });

  it("returns next class on different day if today's classes are over", () => {
    const { store, scheduleId } = makeTestStore();
    // Monday after period 1 (09:00-10:30), next is Wed period 3 (13:00)
    const mondayAfternoon = new Date(2025, 2, 17, 11, 0, 0);
    const result = getNextClass(store, scheduleId, mondayAfternoon);
    expect(result).not.toBeNull();
    expect(result?.weekday).toBe("Wed");
    expect(result?.period).toBe(3);
  });

  it("wraps to next week if all classes have passed", () => {
    const { store, scheduleId } = makeTestStore();
    // Saturday afternoon - both Mon and Wed classes are in the past
    const satAfternoon = new Date(2025, 2, 22, 15, 0, 0);
    const result = getNextClass(store, scheduleId, satAfternoon);
    expect(result).not.toBeNull();
    expect(result?.weekday).toBe("Mon");
  });
});

// ========================================
// shouldNotify
// ========================================

describe("shouldNotify", () => {
  function makeNextClass(startTime: Date): NextClass {
    return {
      schedule: {
        id: "schedule-1",
        academicYear: 2025,
        term: createTermInfo("Spring", "Semester"),
        grid: {},
        slots: {},
        exceptions: {},
      },
      slot: { id: "slot-1", courseId: "course-1" },
      course: {
        id: "course-1",
        name: "テスト",
        instructors: ["山田"],
      },
      timeSlotKey: "Mon-1" as TimeSlotKey,
      startTime,
      weekday: "Mon",
      period: 1,
    };
  }

  it("returns timing when within 30 second window", () => {
    const classTime = new Date(2025, 2, 17, 9, 0, 0);
    const nextClass = makeNextClass(classTime);
    // 10 minutes before class: 8:50
    const now = new Date(2025, 2, 17, 8, 50, 0);
    const result = shouldNotify(nextClass, [-10], now);
    expect(result).toBe(-10);
  });

  it("returns null when outside window", () => {
    const classTime = new Date(2025, 2, 17, 9, 0, 0);
    const nextClass = makeNextClass(classTime);
    // 15 minutes before class: 8:45 (not matching -10 timing)
    const now = new Date(2025, 2, 17, 8, 45, 0);
    const result = shouldNotify(nextClass, [-10], now);
    expect(result).toBeNull();
  });

  it("does not notify for already sent notifications", () => {
    const classTime = new Date(2025, 2, 17, 9, 0, 0);
    const nextClass = makeNextClass(classTime);
    const now = new Date(2025, 2, 17, 8, 50, 0);
    const sent = new Set(["schedule-1-Mon-1--10"]);
    const result = shouldNotify(nextClass, [-10], now, sent);
    expect(result).toBeNull();
  });

  it("checks multiple timings and returns first match", () => {
    const classTime = new Date(2025, 2, 17, 9, 0, 0);
    const nextClass = makeNextClass(classTime);
    // 30 minutes before: 8:30
    const now = new Date(2025, 2, 17, 8, 30, 0);
    const result = shouldNotify(nextClass, [-30, -10], now);
    expect(result).toBe(-30);
  });
});

// ========================================
// createNotificationMessage
// ========================================

describe("createNotificationMessage", () => {
  it("creates correct message", () => {
    const nextClass: NextClass = {
      schedule: {
        id: "schedule-1",
        academicYear: 2025,
        term: createTermInfo("Spring", "Semester"),
        grid: {},
        slots: {},
        exceptions: {},
      },
      slot: { id: "slot-1", courseId: "course-1" },
      course: {
        id: "course-1",
        name: "プログラミング入門",
        instructors: ["山田太郎", "佐藤花子"],
      },
      timeSlotKey: "Mon-1" as TimeSlotKey,
      startTime: new Date(2025, 2, 17, 9, 0, 0),
      weekday: "Mon",
      period: 1,
    };

    const msg = createNotificationMessage(nextClass, -10);
    expect(msg.title).toBe("10分後に授業があります");
    expect(msg.body).toContain("プログラミング入門");
    expect(msg.body).toContain("山田太郎, 佐藤花子");
    expect(msg.body).toContain("1限");
    expect(msg.body).toContain("09:00");
  });

  it("uses custom instructors from slot", () => {
    const nextClass: NextClass = {
      schedule: {
        id: "s1",
        academicYear: 2025,
        term: createTermInfo("Spring", "Semester"),
        grid: {},
        slots: {},
        exceptions: {},
      },
      slot: {
        id: "slot-1",
        courseId: "course-1",
        customInstructors: ["カスタム教員"],
      },
      course: {
        id: "course-1",
        name: "テスト",
        instructors: ["デフォルト教員"],
      },
      timeSlotKey: "Mon-1" as TimeSlotKey,
      startTime: new Date(2025, 2, 17, 9, 0, 0),
      weekday: "Mon",
      period: 1,
    };

    const msg = createNotificationMessage(nextClass, -5);
    expect(msg.body).toContain("カスタム教員");
    expect(msg.body).not.toContain("デフォルト教員");
  });
});
