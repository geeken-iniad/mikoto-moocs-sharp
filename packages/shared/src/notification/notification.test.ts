import { describe, expect, it } from "vitest";
import type { ScheduleStore } from "../schedule/types";
import type { NextClass } from ".";
import { createNotificationMessage, getNextClass, shouldNotify } from ".";

const scheduleStore: ScheduleStore = {
  schemaVersion: 1,
  courses: {
    course1: {
      id: "course1",
      name: "Domain Design",
      instructors: ["Alice", "Bob"],
    },
    course2: {
      id: "course2",
      name: "Boundary Testing",
      instructors: ["Carol"],
    },
  },
  schedules: {
    schedule1: {
      id: "schedule1",
      academicYear: 2026,
      term: { semester: "Spring", division: "Semester" },
      grid: {
        "Mon-1": "slot1",
        "Mon-2": "slot2",
        "Tue-1": "missing-slot",
      },
      slots: {
        slot1: {
          id: "slot1",
          courseId: "course1",
          customInstructors: ["Custom Alice"],
        },
        slot2: {
          id: "slot2",
          courseId: "course2",
        },
      },
      exceptions: {},
    },
  },
};

const localDate = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
) => new Date(year, month - 1, day, hour, minute, second);

const localDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

describe("notification domain", () => {
  it("returns the nearest future class from the selected schedule", () => {
    const nextClass = getNextClass(
      scheduleStore,
      "schedule1",
      localDate(2026, 5, 18, 8, 50),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-1");
    expect(nextClass?.course.name).toBe("Domain Design");
    expect(nextClass?.startTime.toISOString()).toBe(
      localDate(2026, 5, 18, 9, 0).toISOString(),
    );
  });

  it("skips past classes on the same day", () => {
    const nextClass = getNextClass(
      scheduleStore,
      "schedule1",
      localDate(2026, 5, 18, 9, 1),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-2");
  });

  it("skips classes cancelled by schedule exceptions", () => {
    const nextClass = getNextClass(
      {
        ...scheduleStore,
        schedules: {
          schedule1: {
            ...scheduleStore.schedules.schedule1,
            exceptions: {
              "2026-05-18": [
                {
                  id: "exception1",
                  slotId: "slot1",
                  date: "2026-05-18",
                  type: "cancellation",
                },
              ],
            },
          },
        },
      },
      "schedule1",
      localDate(2026, 5, 18, 8, 50),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-2");
  });

  it("skips cancellations when another same-slot exception appears first", () => {
    const nextClass = getNextClass(
      {
        ...scheduleStore,
        schedules: {
          schedule1: {
            ...scheduleStore.schedules.schedule1,
            exceptions: {
              "2026-05-18": [
                {
                  id: "exception1",
                  slotId: "slot1",
                  date: "2026-05-18",
                  type: "room-change",
                },
                {
                  id: "exception2",
                  slotId: "slot1",
                  date: "2026-05-18",
                  type: "cancellation",
                },
              ],
            },
          },
        },
      },
      "schedule1",
      localDate(2026, 5, 18, 8, 50),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-2");
  });

  it("keeps recurring slots eligible after a cancelled occurrence", () => {
    const nextClass = getNextClass(
      {
        ...scheduleStore,
        schedules: {
          schedule1: {
            ...scheduleStore.schedules.schedule1,
            grid: { "Mon-1": "slot1" },
            exceptions: {
              "2026-05-18": [
                {
                  id: "exception1",
                  slotId: "slot1",
                  date: "2026-05-18",
                  type: "cancellation",
                },
              ],
            },
          },
        },
      },
      "schedule1",
      localDate(2026, 5, 18, 8, 50),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-1");
    expect(nextClass?.startTime.toISOString()).toBe(
      localDate(2026, 5, 25, 9, 0).toISOString(),
    );
  });

  it("continues after all known consecutive cancellations", () => {
    const cancellationDates = Array.from({ length: 9 }, (_, index) => {
      const date = localDate(2026, 5, 18, 9, 0);
      date.setDate(date.getDate() + index * 7);
      return localDateKey(date);
    });
    const nextClass = getNextClass(
      {
        ...scheduleStore,
        schedules: {
          schedule1: {
            ...scheduleStore.schedules.schedule1,
            grid: { "Mon-1": "slot1" },
            exceptions: Object.fromEntries(
              cancellationDates.map((date, index) => [
                date,
                [
                  {
                    id: `exception${index + 1}`,
                    slotId: "slot1",
                    date,
                    type: "cancellation" as const,
                  },
                ],
              ]),
            ),
          },
        },
      },
      "schedule1",
      localDate(2026, 5, 18, 8, 50),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-1");
    expect(nextClass?.startTime.toISOString()).toBe(
      localDate(2026, 7, 20, 9, 0).toISOString(),
    );
  });

  it("returns the next week class from Sunday", () => {
    const nextClass = getNextClass(
      scheduleStore,
      "schedule1",
      localDate(2026, 5, 17, 8, 50),
    );

    expect(nextClass?.timeSlotKey).toBe("Mon-1");
    expect(nextClass?.startTime.toISOString()).toBe(
      localDate(2026, 5, 18, 9, 0).toISOString(),
    );
  });

  it("returns null for missing schedules", () => {
    expect(
      getNextClass(scheduleStore, "missing", localDate(2026, 5, 18, 8, 50)),
    ).toBeNull();
  });

  it("returns a notification timing once within the notification window", () => {
    const nextClass = getNextClass(
      scheduleStore,
      "schedule1",
      localDate(2026, 5, 18, 8, 40),
    ) as NextClass;
    const sentNotifications = new Set<string>();
    const now = localDate(2026, 5, 18, 8, 50, 15);

    expect(shouldNotify(nextClass, [-10], now, sentNotifications)).toBe(-10);
    expect(shouldNotify(nextClass, [-10], now, sentNotifications)).toBeNull();
    expect([...sentNotifications]).toEqual(["schedule1-Mon-1--10"]);
  });

  it("does not notify outside the 30 second window", () => {
    const nextClass = getNextClass(
      scheduleStore,
      "schedule1",
      localDate(2026, 5, 18, 8, 40),
    ) as NextClass;

    expect(
      shouldNotify(nextClass, [-10], localDate(2026, 5, 18, 8, 50, 31)),
    ).toBeNull();
  });

  it("creates notification messages with custom instructors", () => {
    const nextClass = getNextClass(
      scheduleStore,
      "schedule1",
      localDate(2026, 5, 18, 8, 50),
    ) as NextClass;

    expect(createNotificationMessage(nextClass, -10)).toEqual({
      title: "10分後に授業があります",
      body: "Domain Design(Custom Alice)\n1限(09:00〜10:30)",
    });
  });
});
