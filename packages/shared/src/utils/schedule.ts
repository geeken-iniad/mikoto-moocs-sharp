import type {
  Course,
  Offering,
  Schedule,
  ScheduleStore,
  Weekday,
  Period,
  TermInfo,
  Semester,
  Quarter,
  TermDivision,
  CampusId,
} from "../types";
import { VALID_TERM_DIVISIONS, SEMESTER_LABELS, CAMPUS_LABELS } from "../constants";

/**
 * Generate a new UUID
 */
export function generateUUID(): string {
  return crypto.randomUUID();
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
    termInfo.division === "Semester" ? "" : `${termInfo.division}Q`;
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
    const quarterNum = Number.parseInt(divisionStr[0], 10) as Quarter;
    division = quarterNum;
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
 * Create a new Offering
 */
export function createOffering(
  courseId: string,
  weekday: Weekday,
  period: Period,
  options?: Partial<Omit<Offering, "id" | "courseId" | "weekday" | "period">>,
): Offering {
  return {
    id: generateUUID(),
    courseId,
    weekday,
    period,
    ...options,
  };
}

/**
 * Create a new Schedule with validated term info
 * @throws Error if the term combination is invalid
 */
export function createSchedule(
  academicYear: number,
  termInfo: TermInfo,
  offeringIds: string[] = [],
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
    offeringIds,
  };
}

/**
 * Create an empty ScheduleStore
 */
export function createScheduleStore(): ScheduleStore {
  return {
    courses: {},
    offerings: {},
    schedules: {},
  };
}

/**
 * Get offerings for a specific schedule
 */
export function getOfferingsForSchedule(
  store: ScheduleStore,
  scheduleId: string,
): Offering[] {
  const schedule = store.schedules[scheduleId];
  if (!schedule) return [];

  return schedule.offeringIds
    .map((id) => store.offerings[id])
    .filter((offering): offering is Offering => offering !== undefined);
}

/**
 * Get courses for a specific schedule
 */
export function getCoursesForSchedule(
  store: ScheduleStore,
  scheduleId: string,
): Course[] {
  const offerings = getOfferingsForSchedule(store, scheduleId);
  const courseIds = new Set(offerings.map((o) => o.courseId));

  return Array.from(courseIds)
    .map((id) => store.courses[id])
    .filter((course): course is Course => course !== undefined);
}

/**
 * Get offerings for a specific weekday and period
 */
export function getOfferingsByWeekdayAndPeriod(
  store: ScheduleStore,
  scheduleId: string,
  weekday: Weekday,
  period: Period,
): Offering | undefined {
  const offerings = getOfferingsForSchedule(store, scheduleId);
  return offerings.find((o) => o.weekday === weekday && o.period === period);
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
 * Add an offering to the store
 */
export function addOffering(
  store: ScheduleStore,
  offering: Offering,
): ScheduleStore {
  return {
    ...store,
    offerings: {
      ...store.offerings,
      [offering.id]: offering,
    },
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
 * Add an offering to a schedule
 */
export function addOfferingToSchedule(
  store: ScheduleStore,
  scheduleId: string,
  offeringId: string,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) return store;

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        offeringIds: [...schedule.offeringIds, offeringId],
      },
    },
  };
}

/**
 * Remove an offering from a schedule
 */
export function removeOfferingFromSchedule(
  store: ScheduleStore,
  scheduleId: string,
  offeringId: string,
): ScheduleStore {
  const schedule = store.schedules[scheduleId];
  if (!schedule) return store;

  return {
    ...store,
    schedules: {
      ...store.schedules,
      [scheduleId]: {
        ...schedule,
        offeringIds: schedule.offeringIds.filter((id) => id !== offeringId),
      },
    },
  };
}
