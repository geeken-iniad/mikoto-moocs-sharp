import { describe, expect, it } from "vitest";
import type {
  Course,
  ExceptionEntry,
  Schedule,
  ScheduleSlot,
  ScheduleStore,
  TimeSlotKey,
} from "../../types";
import {
  addCourse,
  addException,
  addSchedule,
  addSlot,
  createCourse,
  createException,
  createSchedule,
  createScheduleStore,
  createTermInfo,
  createTimeSlotKey,
  deleteCourse,
  deleteSchedule,
  duplicateSchedule,
  formatTermInfo,
  getExceptionForSlot,
  getExceptionsByDate,
  getSlotByTimeSlot,
  isCourseUsed,
  isValidTermInfo,
  moveSlot,
  parseTermString,
  parseTimeSlotKey,
  removeException,
  removeSlot,
  resolveDeliveryMode,
  resolveInstructors,
  resolveRooms,
  updateCourse,
  updateException,
  updateSlot,
  validateException,
  validateRoom,
  validateStore,
} from "../schedule";

// ========================================
// Helpers
// ========================================

function makeStore(): ScheduleStore {
  return createScheduleStore();
}

function makeCourse(name = "テスト科目"): Course {
  return createCourse(name, ["山田太郎"]);
}

function makeStoreWithCourseAndSchedule(): {
  store: ScheduleStore;
  course: Course;
  schedule: Schedule;
} {
  const course = makeCourse();
  const schedule = createSchedule(2025, createTermInfo("Spring", "Semester"));
  let store = makeStore();
  store = addCourse(store, course);
  store = addSchedule(store, schedule);
  return { store, course, schedule };
}

/** Extract slotId from grid, throwing if missing (avoids non-null assertions) */
function getSlotId(
  store: ScheduleStore,
  scheduleId: string,
  key: TimeSlotKey,
): string {
  const slotId = store.schedules[scheduleId].grid[key];
  if (!slotId) throw new Error(`No slot at ${key}`);
  return slotId;
}

// ========================================
// TimeSlotKey Utilities
// ========================================

describe("createTimeSlotKey", () => {
  it("creates a valid key", () => {
    expect(createTimeSlotKey("Mon", 1)).toBe("Mon-1");
    expect(createTimeSlotKey("Sat", 7)).toBe("Sat-7");
  });
});

describe("parseTimeSlotKey", () => {
  it("parses valid keys", () => {
    expect(parseTimeSlotKey("Mon-1" as TimeSlotKey)).toEqual({
      weekday: "Mon",
      period: 1,
    });
    expect(parseTimeSlotKey("Fri-5" as TimeSlotKey)).toEqual({
      weekday: "Fri",
      period: 5,
    });
  });

  it("returns null for invalid keys", () => {
    expect(parseTimeSlotKey("invalid" as TimeSlotKey)).toBeNull();
    expect(parseTimeSlotKey("Mon-8" as TimeSlotKey)).toBeNull();
    expect(parseTimeSlotKey("Sun-1" as TimeSlotKey)).toBeNull();
  });
});

// ========================================
// Term Utilities
// ========================================

describe("isValidTermInfo", () => {
  it("validates Spring terms", () => {
    expect(isValidTermInfo({ semester: "Spring", division: "Semester" })).toBe(
      true,
    );
    expect(isValidTermInfo({ semester: "Spring", division: 1 })).toBe(true);
    expect(isValidTermInfo({ semester: "Spring", division: 2 })).toBe(true);
    expect(isValidTermInfo({ semester: "Spring", division: 3 })).toBe(false);
    expect(isValidTermInfo({ semester: "Spring", division: 4 })).toBe(false);
  });

  it("validates Fall terms", () => {
    expect(isValidTermInfo({ semester: "Fall", division: "Semester" })).toBe(
      true,
    );
    expect(isValidTermInfo({ semester: "Fall", division: 3 })).toBe(true);
    expect(isValidTermInfo({ semester: "Fall", division: 4 })).toBe(true);
    expect(isValidTermInfo({ semester: "Fall", division: 1 })).toBe(false);
    expect(isValidTermInfo({ semester: "Fall", division: 2 })).toBe(false);
  });
});

describe("createTermInfo", () => {
  it("creates valid term info", () => {
    expect(createTermInfo("Spring", "Semester")).toEqual({
      semester: "Spring",
      division: "Semester",
    });
  });

  it("throws for invalid combinations", () => {
    expect(() => createTermInfo("Spring", 3)).toThrow();
    expect(() => createTermInfo("Fall", 1)).toThrow();
  });
});

describe("formatTermInfo", () => {
  it("formats semester terms", () => {
    expect(
      formatTermInfo(2024, { semester: "Spring", division: "Semester" }),
    ).toBe("2024春学期");
    expect(
      formatTermInfo(2024, { semester: "Fall", division: "Semester" }),
    ).toBe("2024秋学期");
  });

  it("formats quarter terms", () => {
    expect(formatTermInfo(2024, { semester: "Spring", division: 1 })).toBe(
      "2024春学期1Q",
    );
    expect(formatTermInfo(2025, { semester: "Fall", division: 4 })).toBe(
      "2025秋学期4Q",
    );
  });
});

describe("parseTermString", () => {
  it("parses semester strings", () => {
    expect(parseTermString("2024春学期")).toEqual({
      academicYear: 2024,
      termInfo: { semester: "Spring", division: "Semester" },
    });
  });

  it("parses quarter strings", () => {
    expect(parseTermString("2024春学期1Q")).toEqual({
      academicYear: 2024,
      termInfo: { semester: "Spring", division: 1 },
    });
  });

  it("returns null for invalid strings", () => {
    expect(parseTermString("invalid")).toBeNull();
    expect(parseTermString("2024冬学期")).toBeNull();
    // Spring with 3Q is invalid
    expect(parseTermString("2024春学期3Q")).toBeNull();
  });
});

// ========================================
// Course Operations
// ========================================

describe("addCourse / updateCourse / deleteCourse", () => {
  it("adds a course to the store", () => {
    const store = makeStore();
    const course = makeCourse();
    const newStore = addCourse(store, course);
    expect(newStore.courses[course.id]).toEqual(course);
  });

  it("updates a course", () => {
    let store = makeStore();
    const course = makeCourse();
    store = addCourse(store, course);
    store = updateCourse(store, course.id, { name: "更新科目" });
    expect(store.courses[course.id].name).toBe("更新科目");
  });

  it("throws when updating non-existent course", () => {
    expect(() => updateCourse(makeStore(), "fake-id", { name: "X" })).toThrow(
      "Course not found",
    );
  });

  it("deletes a course and cascades to slots and exceptions", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);

    // Add exception to the slot
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);
    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    // Delete course - should cascade
    store = deleteCourse(store, course.id);
    expect(store.courses[course.id]).toBeUndefined();
    expect(
      store.schedules[schedule.id].grid["Mon-1" as TimeSlotKey],
    ).toBeUndefined();
    expect(store.schedules[schedule.id].slots[slotId]).toBeUndefined();
    expect(
      store.schedules[schedule.id].exceptions["2025-04-15"],
    ).toBeUndefined();
  });
});

describe("isCourseUsed", () => {
  it("returns false when no slots reference the course", () => {
    const { store, course } = makeStoreWithCourseAndSchedule();
    expect(isCourseUsed(store, course.id)).toBe(false);
  });

  it("returns true when a slot references the course", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    expect(isCourseUsed(store, course.id)).toBe(true);
  });
});

// ========================================
// Slot Operations
// ========================================

describe("addSlot", () => {
  it("adds a slot to the grid", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Tue-3" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Tue-3" as TimeSlotKey);
    expect(store.schedules[schedule.id].slots[slotId].courseId).toBe(course.id);
  });

  it("throws for occupied time slot", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    expect(() =>
      addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id),
    ).toThrow("already occupied");
  });

  it("throws for non-existent course", () => {
    const { store, schedule } = makeStoreWithCourseAndSchedule();
    expect(() =>
      addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, "fake-course"),
    ).toThrow("Course not found");
  });

  it("throws for non-existent schedule", () => {
    const { store, course } = makeStoreWithCourseAndSchedule();
    expect(() =>
      addSlot(store, "fake-schedule", "Mon-1" as TimeSlotKey, course.id),
    ).toThrow("Schedule not found");
  });
});

describe("moveSlot", () => {
  it("moves a slot between time slots", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);

    store = moveSlot(
      store,
      schedule.id,
      "Mon-1" as TimeSlotKey,
      "Tue-2" as TimeSlotKey,
    );

    expect(
      store.schedules[schedule.id].grid["Mon-1" as TimeSlotKey],
    ).toBeUndefined();
    expect(store.schedules[schedule.id].grid["Tue-2" as TimeSlotKey]).toBe(
      slotId,
    );
  });

  it("throws when source is empty", () => {
    const { store, schedule } = makeStoreWithCourseAndSchedule();
    expect(() =>
      moveSlot(
        store,
        schedule.id,
        "Mon-1" as TimeSlotKey,
        "Tue-2" as TimeSlotKey,
      ),
    ).toThrow("No slot found");
  });

  it("throws when destination is occupied", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    store = addSlot(store, schedule.id, "Tue-2" as TimeSlotKey, course.id);
    expect(() =>
      moveSlot(
        store,
        schedule.id,
        "Mon-1" as TimeSlotKey,
        "Tue-2" as TimeSlotKey,
      ),
    ).toThrow("already occupied");
  });
});

describe("updateSlot", () => {
  it("updates slot properties", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);

    store = updateSlot(store, schedule.id, slotId, { memo: "テストメモ" });
    expect(store.schedules[schedule.id].slots[slotId].memo).toBe("テストメモ");
  });

  it("throws for non-existent slot", () => {
    const { store, schedule } = makeStoreWithCourseAndSchedule();
    expect(() =>
      updateSlot(store, schedule.id, "fake-slot", { memo: "X" }),
    ).toThrow("Slot not found");
  });
});

describe("removeSlot", () => {
  it("removes a slot and its exceptions", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);

    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    store = removeSlot(store, schedule.id, "Mon-1" as TimeSlotKey);
    expect(
      store.schedules[schedule.id].grid["Mon-1" as TimeSlotKey],
    ).toBeUndefined();
    expect(store.schedules[schedule.id].slots[slotId]).toBeUndefined();
    expect(
      store.schedules[schedule.id].exceptions["2025-04-15"],
    ).toBeUndefined();
  });

  it("returns store unchanged for non-existent schedule", () => {
    const store = makeStore();
    expect(removeSlot(store, "fake", "Mon-1" as TimeSlotKey)).toBe(store);
  });

  it("returns store unchanged for empty time slot", () => {
    const { store, schedule } = makeStoreWithCourseAndSchedule();
    expect(removeSlot(store, schedule.id, "Mon-1" as TimeSlotKey)).toBe(store);
  });
});

// ========================================
// Schedule Operations
// ========================================

describe("createSchedule", () => {
  it("creates with valid term info", () => {
    const schedule = createSchedule(2025, createTermInfo("Spring", "Semester"));
    expect(schedule.academicYear).toBe(2025);
    expect(schedule.term).toEqual({ semester: "Spring", division: "Semester" });
    expect(schedule.grid).toEqual({});
    expect(schedule.slots).toEqual({});
    expect(schedule.exceptions).toEqual({});
  });

  it("throws for invalid term info", () => {
    expect(() =>
      createSchedule(2025, { semester: "Spring", division: 3 }),
    ).toThrow();
  });
});

describe("duplicateSchedule", () => {
  it("duplicates with new IDs", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);
    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    store = duplicateSchedule(
      store,
      schedule.id,
      2025,
      createTermInfo("Fall", "Semester"),
    );

    const scheduleIds = Object.keys(store.schedules);
    expect(scheduleIds).toHaveLength(2);

    const newScheduleId = scheduleIds.find((id) => id !== schedule.id);
    expect(newScheduleId).toBeDefined();
    const newSchedule = store.schedules[newScheduleId as string];
    expect(newSchedule.academicYear).toBe(2025);
    expect(newSchedule.term).toEqual({
      semester: "Fall",
      division: "Semester",
    });

    // Slot IDs should be different
    const newSlotId = newSchedule.grid["Mon-1" as TimeSlotKey] as string;
    expect(newSlotId).toBeDefined();
    expect(newSlotId).not.toBe(slotId);
    // But reference the same course
    expect(newSchedule.slots[newSlotId].courseId).toBe(course.id);
  });
});

describe("deleteSchedule", () => {
  it("removes the schedule", () => {
    let { store, schedule } = makeStoreWithCourseAndSchedule();
    store = deleteSchedule(store, schedule.id);
    expect(store.schedules[schedule.id]).toBeUndefined();
  });
});

// ========================================
// Exception Operations
// ========================================

describe("addException", () => {
  it("adds an exception", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);

    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    expect(store.schedules[schedule.id].exceptions["2025-04-15"]).toHaveLength(
      1,
    );
  });

  it("throws for non-existent slot", () => {
    const { store, schedule } = makeStoreWithCourseAndSchedule();
    const exception = createException(
      "fake-slot",
      "2025-04-15",
      "cancellation",
    );
    expect(() => addException(store, schedule.id, exception)).toThrow(
      "Slot not found",
    );
  });
});

describe("updateException", () => {
  it("updates exception properties", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);

    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    store = updateException(store, schedule.id, exception.id, {
      memo: "台風のため",
    });

    expect(store.schedules[schedule.id].exceptions["2025-04-15"][0].memo).toBe(
      "台風のため",
    );
  });

  it("throws for non-existent exception", () => {
    const { store, schedule } = makeStoreWithCourseAndSchedule();
    expect(() =>
      updateException(store, schedule.id, "fake-id", { memo: "X" }),
    ).toThrow("Exception not found");
  });
});

describe("removeException", () => {
  it("removes an exception and cleans up empty dates", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);

    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);
    store = removeException(store, schedule.id, exception.id);

    expect(
      store.schedules[schedule.id].exceptions["2025-04-15"],
    ).toBeUndefined();
  });
});

// ========================================
// Display Resolution
// ========================================

describe("resolveRooms", () => {
  const course: Course = {
    id: "c1",
    name: "テスト",
    instructors: [],
    defaultRooms: [{ type: "physical", number: "A-101" }],
  };
  const slot: ScheduleSlot = { id: "s1", courseId: "c1" };

  it("returns course default rooms when no overrides", () => {
    expect(resolveRooms(course, slot)).toEqual(course.defaultRooms);
  });

  it("returns slot rooms when set", () => {
    const slotWithRooms: ScheduleSlot = {
      ...slot,
      rooms: [{ type: "online", number: "Zoom" }],
    };
    expect(resolveRooms(course, slotWithRooms)).toEqual(slotWithRooms.rooms);
  });

  it("returns exception rooms when set", () => {
    const exception: ExceptionEntry = {
      id: "e1",
      slotId: "s1",
      date: "2025-04-15",
      type: "room-change",
      changedRooms: [{ type: "physical", number: "B-201" }],
    };
    expect(resolveRooms(course, slot, exception)).toEqual(
      exception.changedRooms,
    );
  });

  it("returns empty array when no rooms anywhere", () => {
    const noRoomsCourse: Course = { id: "c1", name: "テスト", instructors: [] };
    expect(resolveRooms(noRoomsCourse, slot)).toEqual([]);
  });
});

describe("resolveInstructors", () => {
  it("returns course instructors by default", () => {
    const course: Course = {
      id: "c1",
      name: "テスト",
      instructors: ["田中"],
    };
    const slot: ScheduleSlot = { id: "s1", courseId: "c1" };
    expect(resolveInstructors(course, slot)).toEqual(["田中"]);
  });

  it("returns custom instructors when set", () => {
    const course: Course = {
      id: "c1",
      name: "テスト",
      instructors: ["田中"],
    };
    const slot: ScheduleSlot = {
      id: "s1",
      courseId: "c1",
      customInstructors: ["佐藤"],
    };
    expect(resolveInstructors(course, slot)).toEqual(["佐藤"]);
  });
});

describe("resolveDeliveryMode", () => {
  it("defaults to face-to-face", () => {
    const slot: ScheduleSlot = { id: "s1", courseId: "c1" };
    expect(resolveDeliveryMode(slot)).toBe("face-to-face");
  });

  it("uses slot default", () => {
    const slot: ScheduleSlot = {
      id: "s1",
      courseId: "c1",
      defaultDeliveryMode: "online",
    };
    expect(resolveDeliveryMode(slot)).toBe("online");
  });

  it("uses exception override", () => {
    const slot: ScheduleSlot = {
      id: "s1",
      courseId: "c1",
      defaultDeliveryMode: "online",
    };
    const exception: ExceptionEntry = {
      id: "e1",
      slotId: "s1",
      date: "2025-04-15",
      type: "delivery-mode-change",
      changedDeliveryMode: "on-demand",
    };
    expect(resolveDeliveryMode(slot, exception)).toBe("on-demand");
  });
});

// ========================================
// Store Utilities
// ========================================

describe("getSlotByTimeSlot", () => {
  it("returns slot for occupied time slot", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const updatedSchedule = store.schedules[schedule.id];
    const slot = getSlotByTimeSlot(updatedSchedule, "Mon-1" as TimeSlotKey);
    expect(slot?.courseId).toBe(course.id);
  });

  it("returns undefined for empty time slot", () => {
    const schedule = createSchedule(2025, createTermInfo("Spring", "Semester"));
    expect(getSlotByTimeSlot(schedule, "Mon-1" as TimeSlotKey)).toBeUndefined();
  });
});

describe("getExceptionsByDate / getExceptionForSlot", () => {
  it("returns exceptions for a date", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);
    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    expect(
      getExceptionsByDate(store.schedules[schedule.id], "2025-04-15"),
    ).toHaveLength(1);
    expect(
      getExceptionsByDate(store.schedules[schedule.id], "2025-04-16"),
    ).toHaveLength(0);
  });

  it("returns specific exception for slot+date", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);
    const exception = createException(slotId, "2025-04-15", "cancellation");
    store = addException(store, schedule.id, exception);

    expect(
      getExceptionForSlot(store.schedules[schedule.id], slotId, "2025-04-15"),
    ).toBeDefined();
    expect(
      getExceptionForSlot(store.schedules[schedule.id], "fake", "2025-04-15"),
    ).toBeUndefined();
  });
});

// ========================================
// Validation
// ========================================

describe("validateStore", () => {
  it("returns no errors for a valid store", () => {
    const { store } = makeStoreWithCourseAndSchedule();
    expect(validateStore(store)).toEqual([]);
  });

  it("detects broken grid -> slot reference", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);

    // Break the reference: remove slot but keep grid entry
    const slotId = getSlotId(store, schedule.id, "Mon-1" as TimeSlotKey);
    const { [slotId]: _, ...remainingSlots } =
      store.schedules[schedule.id].slots;
    store = {
      ...store,
      schedules: {
        ...store.schedules,
        [schedule.id]: {
          ...store.schedules[schedule.id],
          slots: remainingSlots,
        },
      },
    };

    const errors = validateStore(store);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain("does not exist in slots");
  });

  it("detects broken slot -> course reference", () => {
    let { store, course, schedule } = makeStoreWithCourseAndSchedule();
    store = addSlot(store, schedule.id, "Mon-1" as TimeSlotKey, course.id);

    // Remove course but keep slot
    const { [course.id]: _, ...remainingCourses } = store.courses;
    store = { ...store, courses: remainingCourses };

    const errors = validateStore(store);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain("does not exist in courses");
  });

  it("detects invalid academic year", () => {
    const schedule = createSchedule(2025, createTermInfo("Spring", "Semester"));
    const store: ScheduleStore = {
      schemaVersion: 1,
      courses: {},
      schedules: {
        [schedule.id]: { ...schedule, academicYear: 1999 },
      },
    };

    const errors = validateStore(store);
    expect(errors.some((e) => e.message.includes("out of valid range"))).toBe(
      true,
    );
  });
});

describe("validateRoom", () => {
  it("returns null for valid physical room", () => {
    expect(validateRoom({ type: "physical", number: "A-101" })).toBeNull();
  });

  it("returns error for physical room without number", () => {
    expect(validateRoom({ type: "physical", number: "" })).toBe(
      "Physical room must have a room number",
    );
  });

  it("returns null for online room", () => {
    expect(validateRoom({ type: "online", number: "Zoom" })).toBeNull();
  });
});

describe("validateException", () => {
  it("returns null for valid cancellation", () => {
    expect(
      validateException({
        id: "e1",
        slotId: "s1",
        date: "2025-04-15",
        type: "cancellation",
      }),
    ).toBeNull();
  });

  it("returns error for delivery-mode-change without mode", () => {
    expect(
      validateException({
        id: "e1",
        slotId: "s1",
        date: "2025-04-15",
        type: "delivery-mode-change",
      }),
    ).toBe("Delivery mode change exception must have changedDeliveryMode");
  });

  it("returns error for room-change without rooms", () => {
    expect(
      validateException({
        id: "e1",
        slotId: "s1",
        date: "2025-04-15",
        type: "room-change",
      }),
    ).toBe("Room change exception must have changedRooms");
  });

  it("returns error for makeup without info", () => {
    expect(
      validateException({
        id: "e1",
        slotId: "s1",
        date: "2025-04-15",
        type: "makeup",
      }),
    ).toBe("Makeup exception must have makeupInfo");
  });
});
