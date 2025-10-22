import type {
  Course,
  ScheduleSlot,
  Schedule,
  ScheduleStore,
  Weekday,
  Period,
  TimeSlotKey,
  TermInfo,
  Semester,
  Quarter,
  TermDivision,
  CampusId,
  DeliveryMode,
  Room,
  ExceptionEntry,
  ExceptionType,
  ValidationError,
} from "../types";
import { VALID_TERM_DIVISIONS, SEMESTER_LABELS, CAMPUS_LABELS } from "../constants";

export const MIN_ACADEMIC_YEAR = 2000;
export const MAX_ACADEMIC_YEAR = 2100;

/**
 * Generate a new UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

// ========================================
// TimeSlotKey Utilities
// ========================================

/**
 * Create a TimeSlotKey from weekday and period
 */
export function createTimeSlotKey(weekday: Weekday, period: Period): TimeSlotKey {
  return `${weekday}-${period}` as TimeSlotKey;
}

/**
 * Parse a TimeSlotKey into weekday and period
 * Returns null if parsing fails
 */
export function parseTimeSlotKey(key: TimeSlotKey): { weekday: Weekday; period: Period } | null {
  const match = key.match(/^(Mon|Tue|Wed|Thu|Fri|Sat)-([1-7])$/);
  if (!match) return null;

  return {
    weekday: match[1] as Weekday,
    period: Number.parseInt(match[2], 10) as Period,
  };
}

// ========================================
// Term Utilities
// ========================================

/**
 * Validate if the combination of semester and division is valid
 * Spring: Semester, 1Q, 2Q
 * Fall: Semester, 3Q, 4Q
 */
export function isValidTermInfo(termInfo: TermInfo): boolean {
  const validDivisions = VALID_TERM_DIVISIONS[termInfo.semester];
  return validDivisions.includes(termInfo.division);
}

/**
 * Create a TermInfo with validation
 * @throws Error if the combination is invalid
 */
export function createTermInfo(
  semester: Semester,
  division: TermDivision,
): TermInfo {
  const termInfo: TermInfo = { semester, division };
  if (!isValidTermInfo(termInfo)) {
    throw new Error(
      `Invalid term combination: ${semester} with ${division}. ` +
        `Valid divisions for ${semester}: ${VALID_TERM_DIVISIONS[semester].join(", ")}`,
    );
  }
  return termInfo;
}

/**
 * Format TermInfo for display
 * Examples: "2024春学期1Q", "2024秋学期", "2025春学期2Q"
 */
export function formatTermInfo(academicYear: number, termInfo: TermInfo): string {
  const semesterLabel = SEMESTER_LABELS[termInfo.semester];
  const divisionLabel =
    typeof termInfo.division === "number" && termInfo.division >= 1 && termInfo.division <= 4
      ? `${termInfo.division}Q`
      : "";
  return `${academicYear}${semesterLabel}${divisionLabel}`;
}

/**
 * Parse a term string like "2024春学期1Q" into components
 * Returns null if parsing fails
 */
export function parseTermString(termString: string): {
  academicYear: number;
  termInfo: TermInfo;
} | null {
  const match = termString.match(/^(\d{4})(春学期|秋学期)([1-4]Q)?$/);
  if (!match) return null;

  const academicYear = Number.parseInt(match[1], 10);
  const semester: Semester = match[2] === "春学期" ? "Spring" : "Fall";
  const divisionStr = match[3];

  let division: TermDivision;
  if (!divisionStr) {
    division = "Semester";
  } else {
    const quarterNum = Number.parseInt(divisionStr[0], 10);
    if (Number.isNaN(quarterNum) || quarterNum < 1 || quarterNum > 4) {
      return null;
    }
    division = quarterNum as Quarter;
  }

  try {
    const termInfo = createTermInfo(semester, division);
    return { academicYear, termInfo };
  } catch {
    return null;
  }
}

// ========================================
// Campus Utilities
// ========================================

/**
 * Get the Japanese label for a campus ID
 */
export function getCampusLabel(campusId: CampusId): string {
  return CAMPUS_LABELS[campusId];
}

// ========================================
// Course Operations
// ========================================

/**
 * Create a new Course
 */
export function createCourse(
  name: string,
  instructors: string[],
  options?: Partial<Omit<Course, "id" | "name" | "instructors">>,
): Course {
  return {
    id: generateUUID(),
    name,
    instructors,
    ...options,
  };
}

/**
 * Add a course to the store
 */
export function addCourse(
  store: ScheduleStore,
  course: Course,
): ScheduleStore {
  return {
    ...store,
    courses: {
      ...store.courses,
      [course.id]: course,
    },
  };
}

/**
 * Update a course in the store
 */
export function updateCourse(
  store: ScheduleStore,
  courseId: string,
  updates: Partial<Course>,
): ScheduleStore {
  const existingCourse = store.courses[courseId];
  if (!existingCourse) {
    throw new Error(`Course not found: ${courseId}`);
  }

  return {
    ...store,
    courses: {
      ...store.courses,
      [courseId]: { ...existingCourse, ...updates },
    },
  };
}

/**
 * Delete a course from the store (cascades to ScheduleSlots and ExceptionEntries)
 */
export function deleteCourse(
  store: ScheduleStore,
  courseId: string,
): ScheduleStore {
  let newStore = { ...store };

  // Remove course
  const { [courseId]: _, ...remainingCourses } = newStore.courses;
  newStore = { ...newStore, courses: remainingCourses };

  // Remove all slots referencing this course
  for (const scheduleId of Object.keys(newStore.schedules)) {
    const schedule = newStore.schedules[scheduleId];
    const slotsToRemove: string[] = [];

    // Find slots referencing this course
    for (const [slotId, slot] of Object.entries(schedule.slots)) {
      if (slot.courseId === courseId) {
        slotsToRemove.push(slotId);
      }
    }

    // Remove slots and their grid entries
    let newSchedule = { ...schedule };
    for (const slotId of slotsToRemove) {
      // Remove from grid
      const newGrid = { ...newSchedule.grid };
      for (const [key, value] of Object.entries(newGrid)) {
        if (value === slotId) {
          delete newGrid[key as TimeSlotKey];
        }
      }
      newSchedule.grid = newGrid;

      // Remove from slots
      const { [slotId]: __, ...remainingSlots } = newSchedule.slots;
      newSchedule.slots = remainingSlots;

      // Remove exceptions referencing this slot
      const newExceptions = { ...newSchedule.exceptions };
      for (const [date, entries] of Object.entries(newExceptions)) {
        const filtered = entries.filter((e) => e.slotId !== slotId);
        if (filtered.length === 0) {
          delete newExceptions[date];
        } else {
          newExceptions[date] = filtered;
        }
      }
      newSchedule.exceptions = newExceptions;
    }

    newStore.schedules = {
      ...newStore.schedules,
      [scheduleId]: newSchedule,
    };
  }

  return newStore;
}

// ========================================
// ScheduleSlot Operations
// ========================================

/**
 * Create a new ScheduleSlot
 */
export function createScheduleSlot(
  courseId: string,
  options?: Partial<Omit<ScheduleSlot, "id" | "courseId">>,
): ScheduleSlot {
  return {
    id: generateUUID(),
    courseId,
    ...options,
  };
}

/**
 * Add a slot to a schedule at a specific time slot
 * @throws Error if the time slot is already occupied or course doesn't exist
 */
export function addSlot(
  store: ScheduleStore,
  scheduleId: string,
  timeSlot: TimeSlotKey,
  courseId: string,
  overrides?: Partial<Omit<ScheduleSlot, "id" | "courseId">>,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  if (schedule.grid[timeSlot]) {
    throw new Error(`Time slot ${timeSlot} is already occupied`);
  }

  if (!store.courses[courseId]) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const slot = createScheduleSlot(courseId, overrides);

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        grid: {
          ...schedule.grid,
          [timeSlot]: slot.id,
        },
        slots: {
          ...schedule.slots,
          [slot.id]: slot,
        },
      },
    },
  };
}

/**
 * Move a slot from one time slot to another
 * @throws Error if source is empty or destination is occupied
 */
export function moveSlot(
  store: ScheduleStore,
  scheduleId: string,
  from: TimeSlotKey,
  to: TimeSlotKey,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  const slotId = schedule.grid[from];
  if (!slotId) {
    throw new Error(`No slot found at ${from}`);
  }

  if (schedule.grid[to]) {
    throw new Error(`Time slot ${to} is already occupied`);
  }

  const newGrid = { ...schedule.grid };
  delete newGrid[from];
  newGrid[to] = slotId;

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        grid: newGrid,
      },
    },
  };
}

/**
 * Update a slot's information (including courseId)
 * @throws Error if slot or new course doesn't exist
 */
export function updateSlot(
  store: ScheduleStore,
  scheduleId: string,
  slotId: string,
  updates: Partial<Omit<ScheduleSlot, "id">>,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  const slot = schedule.slots[slotId];
  if (!slot) {
    throw new Error(`Slot not found: ${slotId}`);
  }

  // If courseId is being changed, verify the new course exists
  if (updates.courseId && !store.courses[updates.courseId]) {
    throw new Error(`Course not found: ${updates.courseId}`);
  }

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        slots: {
          ...schedule.slots,
          [slotId]: {
            ...slot,
            ...updates,
          },
        },
      },
    },
  };
}

/**
 * Remove a slot from a time slot (cascades to exceptions)
 */
export function removeSlot(
  store: ScheduleStore,
  scheduleId: string,
  timeSlot: TimeSlotKey,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    return store;
  }

  const slotId = schedule.grid[timeSlot];
  if (!slotId) {
    return store;
  }

  const newGrid = { ...schedule.grid };
  delete newGrid[timeSlot];

  const { [slotId]: _, ...remainingSlots } = schedule.slots;

  // Remove exceptions referencing this slot
  const newExceptions = { ...schedule.exceptions };
  for (const [date, entries] of Object.entries(newExceptions)) {
    const filtered = entries.filter((e) => e.slotId !== slotId);
    if (filtered.length === 0) {
      delete newExceptions[date];
    } else {
      newExceptions[date] = filtered;
    }
  }

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        grid: newGrid,
        slots: remainingSlots,
        exceptions: newExceptions,
      },
    },
  };
}

// ========================================
// Schedule Operations
// ========================================

/**
 * Create a new Schedule with validated term info
 * @throws Error if the term combination is invalid
 */
export function createSchedule(
  academicYear: number,
  termInfo: TermInfo,
): Schedule {
  if (!isValidTermInfo(termInfo)) {
    throw new Error(
      `Invalid term combination: ${termInfo.semester} with ${termInfo.division}`,
    );
  }
  return {
    id: generateUUID(),
    academicYear,
    term: termInfo,
    grid: {},
    slots: {},
    exceptions: {},
  };
}

/**
 * Add a schedule to the store
 */
export function addSchedule(
  store: ScheduleStore,
  schedule: Schedule,
): ScheduleStore {
  return {
    ...store,
    schedules: {
      ...store.schedules,
      [schedule.id]: schedule,
    },
  };
}

/**
 * Update a schedule in the store
 */
export function updateSchedule(
  store: ScheduleStore,
  scheduleId: string,
  updates: Partial<Schedule>,
): ScheduleStore {
  const existingSchedule = store.schedules[scheduleId];
  if (!existingSchedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: { ...existingSchedule, ...updates },
    },
  };
}

/**
 * Delete a schedule from the store
 */
export function deleteSchedule(
  store: ScheduleStore,
  scheduleId: string,
): ScheduleStore {
  const { [scheduleId]: _, ...remainingSchedules } = store.schedules;
  return { ...store, schedules: remainingSchedules };
}

/**
 * Duplicate a schedule to a new academic year and term
 * @throws Error if the new term combination is invalid
 */
export function duplicateSchedule(
  store: ScheduleStore,
  sourceScheduleId: string,
  newAcademicYear: number,
  newTermInfo: TermInfo,
): ScheduleStore {
  const source = store.schedules[sourceScheduleId];
  if (!source) {
    throw new Error(`Schedule not found: ${sourceScheduleId}`);
  }

  if (!isValidTermInfo(newTermInfo)) {
    throw new Error(
      `Invalid term combination: ${newTermInfo.semester} with ${newTermInfo.division}`,
    );
  }

  const idMap = new Map<string, string>();
  const newSlots: Record<string, ScheduleSlot> = {};
  const newGrid: Partial<Record<TimeSlotKey, string>> = {};
  const newExceptions: Record<string, ExceptionEntry[]> = {};

  // Duplicate slots
  for (const [oldId, slot] of Object.entries(source.slots)) {
    const newId = generateUUID();
    idMap.set(oldId, newId);
    newSlots[newId] = { ...slot, id: newId };
  }

  // Duplicate grid with new slot IDs
  for (const [key, oldId] of Object.entries(source.grid)) {
    const newId = idMap.get(oldId);
    if (newId) {
      newGrid[key as TimeSlotKey] = newId;
    }
  }

  // Duplicate exceptions with new slot IDs
  for (const [date, entries] of Object.entries(source.exceptions)) {
    newExceptions[date] = entries.map((entry) => {
      const newSlotId = idMap.get(entry.slotId);
      if (!newSlotId) {
        throw new Error(
          `Failed to map slot ID '${entry.slotId}' during schedule duplication. ` +
          `This may indicate the source slot is missing or corrupted.`
        );
      }
      return {
        ...entry,
        id: generateUUID(),
        slotId: newSlotId,
      };
    });
  }

  const newSchedule: Schedule = {
    id: generateUUID(),
    academicYear: newAcademicYear,
    term: newTermInfo,
    grid: newGrid,
    slots: newSlots,
    exceptions: newExceptions,
  };

  return addSchedule(store, newSchedule);
}

// ========================================
// Exception Operations
// ========================================

/**
 * Create a new ExceptionEntry
 */
export function createException(
  slotId: string,
  date: string,
  type: ExceptionType,
  options?: Partial<Omit<ExceptionEntry, "id" | "slotId" | "date" | "type">>,
): ExceptionEntry {
  return {
    id: generateUUID(),
    slotId,
    date,
    type,
    ...options,
  };
}

/**
 * Add an exception to a schedule
 * @throws Error if schedule or slot doesn't exist
 */
export function addException(
  store: ScheduleStore,
  scheduleId: string,
  exception: ExceptionEntry,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  if (!schedule.slots[exception.slotId]) {
    throw new Error(`Slot not found: ${exception.slotId}`);
  }

  const existingExceptions = schedule.exceptions[exception.date] || [];

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        exceptions: {
          ...schedule.exceptions,
          [exception.date]: [...existingExceptions, exception],
        },
      },
    },
  };
}

/**
 * Update an exception in a schedule
 * @throws Error if schedule or exception doesn't exist
 */
export function updateException(
  store: ScheduleStore,
  scheduleId: string,
  exceptionId: string,
  updates: Partial<Omit<ExceptionEntry, "id" | "slotId" | "date">>,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    throw new Error(`Schedule not found: ${scheduleId}`);
  }

  let found = false;
  const newExceptions = { ...schedule.exceptions };

  for (const [date, entries] of Object.entries(newExceptions)) {
    const index = entries.findIndex((e) => e.id === exceptionId);
    if (index !== -1) {
      newExceptions[date] = [
        ...entries.slice(0, index),
        { ...entries[index], ...updates },
        ...entries.slice(index + 1),
      ];
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error(`Exception not found: ${exceptionId}`);
  }

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        exceptions: newExceptions,
      },
    },
  };
}

/**
 * Remove an exception from a schedule
 */
export function removeException(
  store: ScheduleStore,
  scheduleId: string,
  exceptionId: string,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    return store;
  }

  const newExceptions = { ...schedule.exceptions };

  for (const [date, entries] of Object.entries(newExceptions)) {
    const filtered = entries.filter((e) => e.id !== exceptionId);
    if (filtered.length === 0) {
      delete newExceptions[date];
    } else if (filtered.length !== entries.length) {
      newExceptions[date] = filtered;
    }
  }

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        exceptions: newExceptions,
      },
    },
  };
}

// ========================================
// Display Resolution
// ========================================

/**
 * Resolve rooms for a slot on a specific date
 * Priority: Exception > Slot > Course default
 */
export function resolveRooms(
  course: Course,
  slot: ScheduleSlot,
  exception?: ExceptionEntry,
): Room[] {
  if (exception?.changedRooms && exception.changedRooms.length > 0) {
    return exception.changedRooms;
  }
  if (slot.rooms && slot.rooms.length > 0) {
    return slot.rooms;
  }
  return course.defaultRooms ?? [];
}

/**
 * Resolve instructors for a slot
 * Priority: Slot custom > Course default
 */
export function resolveInstructors(
  course: Course,
  slot: ScheduleSlot,
): string[] {
  return slot.customInstructors ?? course.instructors;
}

/**
 * Resolve delivery mode for a slot on a specific date
 * Priority: Exception > Slot > Default (face-to-face)
 */
export function resolveDeliveryMode(
  slot: ScheduleSlot,
  exception?: ExceptionEntry,
): DeliveryMode {
  if (exception?.changedDeliveryMode) {
    return exception.changedDeliveryMode;
  }
  return slot.defaultDeliveryMode ?? "face-to-face";
}

// ========================================
// Store Utilities
// ========================================

/**
 * Create an empty ScheduleStore
 */
export function createScheduleStore(): ScheduleStore {
  return {
    schemaVersion: 1,
    courses: {},
    schedules: {},
  };
}

/**
 * Get a slot by time slot key
 */
export function getSlotByTimeSlot(
  schedule: Schedule,
  timeSlot: TimeSlotKey,
): ScheduleSlot | undefined {
  const slotId = schedule.grid[timeSlot];
  return slotId ? schedule.slots[slotId] : undefined;
}

/**
 * Get exceptions for a specific date
 */
export function getExceptionsByDate(
  schedule: Schedule,
  date: string,
): ExceptionEntry[] {
  return schedule.exceptions[date] ?? [];
}

/**
 * Get exception for a specific slot on a specific date
 */
export function getExceptionForSlot(
  schedule: Schedule,
  slotId: string,
  date: string,
): ExceptionEntry | undefined {
  const exceptions = schedule.exceptions[date] ?? [];
  return exceptions.find((e) => e.slotId === slotId);
}

// ========================================
// Validation
// ========================================

/**
 * Validate the entire ScheduleStore for integrity
 * Returns an array of validation errors (empty if valid)
 */
export function validateStore(store: ScheduleStore): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate each schedule
  for (const [scheduleId, schedule] of Object.entries(store.schedules)) {
    // Check if schedule has required properties
    if (!schedule.grid) {
      errors.push({
        scheduleId,
        message: `Schedule[${scheduleId}]: missing 'grid' property`,
      });
      continue;
    }
    if (!schedule.slots) {
      errors.push({
        scheduleId,
        message: `Schedule[${scheduleId}]: missing 'slots' property`,
      });
      continue;
    }
    if (!schedule.exceptions) {
      errors.push({
        scheduleId,
        message: `Schedule[${scheduleId}]: missing 'exceptions' property`,
      });
      continue;
    }

    // 1. Referential integrity: grid -> slots
    for (const [timeSlot, slotId] of Object.entries(schedule.grid)) {
      if (!schedule.slots[slotId]) {
        errors.push({
          scheduleId,
          message: `Schedule[${scheduleId}]: grid['${timeSlot}'] references slot '${slotId}' but it does not exist in slots`,
        });
      }
    }

    // 2. Referential integrity: exceptions -> slots
    for (const [date, entries] of Object.entries(schedule.exceptions)) {
      for (const entry of entries) {
        if (!schedule.slots[entry.slotId]) {
          errors.push({
            scheduleId,
            message: `Schedule[${scheduleId}]: exception '${entry.id}' on date '${date}' references slot '${entry.slotId}' but it does not exist in slots`,
          });
        }
      }
    }

    // 3. Course existence
    for (const [slotId, slot] of Object.entries(schedule.slots)) {
      if (!store.courses[slot.courseId]) {
        errors.push({
          scheduleId,
          message: `Schedule[${scheduleId}]: slot '${slotId}' references course '${slot.courseId}' but it does not exist in courses`,
        });
      }
    }

    // 4. Term integrity
    if (!isValidTermInfo(schedule.term)) {
      errors.push({
        scheduleId,
        message: `Schedule[${scheduleId}]: invalid term combination (${schedule.term.semester} - ${schedule.term.division})`,
      });
    }

    // 5. Academic year validity
    if (schedule.academicYear < MIN_ACADEMIC_YEAR || schedule.academicYear > MAX_ACADEMIC_YEAR) {
      errors.push({
        scheduleId,
        message: `Schedule[${scheduleId}]: academic year ${schedule.academicYear} is out of valid range (${MIN_ACADEMIC_YEAR}-${MAX_ACADEMIC_YEAR})`,
      });
    }
  }

  return errors;
}

/**
 * Validate a single schedule
 * Returns an array of validation errors (empty if valid)
 */
export function validateSchedule(
  store: ScheduleStore,
  scheduleId: string,
): ValidationError[] {
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    return [{ scheduleId, message: `Schedule not found: ${scheduleId}` }];
  }

  const tempStore: ScheduleStore = {
    ...store,
    schedules: { [scheduleId]: schedule },
  };

  return validateStore(tempStore);
}

/**
 * Check if a Room is valid
 */
export function validateRoom(room: Room): string | null {
  if (room.type === "physical") {
    if (!room.number) {
      return "Physical room must have a room number";
    }
  }
  return null;
}

/**
 * Validate an ExceptionEntry has required fields for its type
 */
export function validateException(exception: ExceptionEntry): string | null {
  switch (exception.type) {
    case "delivery-mode-change":
      if (!exception.changedDeliveryMode) {
        return "Delivery mode change exception must have changedDeliveryMode";
      }
      break;
    case "room-change":
      if (!exception.changedRooms || exception.changedRooms.length === 0) {
        return "Room change exception must have changedRooms";
      }
      break;
    case "makeup":
      if (!exception.makeupInfo) {
        return "Makeup exception must have makeupInfo";
      }
      break;
  }
  return null;
}
