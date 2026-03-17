import { describe, expect, it } from "vitest";
import {
  CampusSettingsSchema,
  KeyboardShortcutSettingsSchema,
  NotificationSettingsSchema,
  ScheduleStoreSchema,
  safeParse,
  ThemeSchema,
} from "../schemas";

describe("ScheduleStoreSchema", () => {
  it("accepts a valid empty store", () => {
    const result = safeParse(ScheduleStoreSchema, {
      schemaVersion: 1,
      courses: {},
      schedules: {},
    });
    expect(result.success).toBe(true);
  });

  it("accepts a store with courses and schedules", () => {
    const result = safeParse(ScheduleStoreSchema, {
      schemaVersion: 1,
      courses: {
        "c-1": {
          id: "c-1",
          name: "テスト科目",
          instructors: ["田中"],
          defaultRooms: [{ type: "physical", number: "A-101" }],
        },
      },
      schedules: {
        "s-1": {
          id: "s-1",
          academicYear: 2025,
          term: { semester: "Spring", division: "Semester" },
          grid: { "Mon-1": "slot-1" },
          slots: {
            "slot-1": { id: "slot-1", courseId: "c-1" },
          },
          exceptions: {
            "2025-04-15": [
              {
                id: "e-1",
                slotId: "slot-1",
                date: "2025-04-15",
                type: "cancellation",
              },
            ],
          },
        },
      },
      instructors: ["田中"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = safeParse(ScheduleStoreSchema, {
      schemaVersion: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid course structure", () => {
    const result = safeParse(ScheduleStoreSchema, {
      schemaVersion: 1,
      courses: {
        "c-1": { id: "c-1" }, // missing name, instructors
      },
      schedules: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid delivery mode", () => {
    const result = safeParse(ScheduleStoreSchema, {
      schemaVersion: 1,
      courses: {},
      schedules: {
        "s-1": {
          id: "s-1",
          academicYear: 2025,
          term: { semester: "Spring", division: "Semester" },
          grid: {},
          slots: {
            "slot-1": {
              id: "slot-1",
              courseId: "c-1",
              defaultDeliveryMode: "teleportation",
            },
          },
          exceptions: {},
        },
      },
    });
    expect(result.success).toBe(false);
  });
});

describe("KeyboardShortcutSettingsSchema", () => {
  it("accepts valid settings", () => {
    const result = safeParse(KeyboardShortcutSettingsSchema, {
      submitShortcut: true,
      numberKeyShortcut: false,
      arrowKeyShortcut: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-boolean values", () => {
    const result = safeParse(KeyboardShortcutSettingsSchema, {
      submitShortcut: "yes",
      numberKeyShortcut: false,
      arrowKeyShortcut: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("CampusSettingsSchema", () => {
  it("accepts empty settings", () => {
    const result = safeParse(CampusSettingsSchema, {});
    expect(result.success).toBe(true);
  });

  it("accepts valid campus", () => {
    const result = safeParse(CampusSettingsSchema, {
      defaultCampus: "akabanedai",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid campus", () => {
    const result = safeParse(CampusSettingsSchema, {
      defaultCampus: "shibuya",
    });
    expect(result.success).toBe(false);
  });
});

describe("NotificationSettingsSchema", () => {
  it("accepts valid settings", () => {
    const result = safeParse(NotificationSettingsSchema, {
      enabled: true,
      timings: [-30, -10],
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing timings", () => {
    const result = safeParse(NotificationSettingsSchema, {
      enabled: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("ThemeSchema", () => {
  it("accepts light/dark", () => {
    expect(safeParse(ThemeSchema, "light").success).toBe(true);
    expect(safeParse(ThemeSchema, "dark").success).toBe(true);
  });

  it("rejects invalid theme", () => {
    expect(safeParse(ThemeSchema, "blue").success).toBe(false);
  });
});
