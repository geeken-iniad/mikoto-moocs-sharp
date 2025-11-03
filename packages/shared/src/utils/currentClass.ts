import type { ScheduleStore, Schedule, Weekday, Period, TimeSlotKey } from "../types";
import { PERIODS } from "../constants";
import { getExceptionForSlot } from "./schedule";

export type ClassStatus = "current" | "next" | null;

export interface CurrentClassInfo {
  courseId: string;
  timeSlotKey: TimeSlotKey;
  status: "current" | "next";
}

/**
 * Get the current weekday as a Weekday type
 */
function getCurrentWeekday(date: Date): Weekday | null {
  const dayIndex = date.getDay(); // 0 (Sun) - 6 (Sat)
  // Convert to our weekday format (Mon-Sat)
  const weekdayMap: Record<number, Weekday | null> = {
    0: null, // Sunday
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return weekdayMap[dayIndex] ?? null;
}

/**
 * Get the period for a given time
 * Returns null if the time is not within any period
 */
function getPeriodForTime(time: Date): Period | null {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  for (const [period, { start, end }] of Object.entries(PERIODS)) {
    if (timeStr >= start && timeStr <= end) {
      return Number(period) as Period;
    }
  }
  return null;
}

/**
 * Find the next scheduled class after the current time
 */
function findNextClass(
  activeSchedule: Schedule,
  currentWeekday: Weekday,
  currentTime: Date,
): CurrentClassInfo | null {
  const orderedPeriods = Object.keys(PERIODS)
    .map((key) => Number(key) as Period)
    .sort((a, b) => a - b);
  const currentTimeStr = `${String(currentTime.getHours()).padStart(2, "0")}:${String(
    currentTime.getMinutes(),
  ).padStart(2, "0")}`;

  const dateCursor = new Date(currentTime);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const weekday = getCurrentWeekday(dateCursor);

    // Skip days without classes (e.g. Sunday)
    if (!weekday) {
      dateCursor.setDate(dateCursor.getDate() + 1);
      continue;
    }

    const dateStr = dateCursor.toISOString().split("T")[0];
    const isSameDay = dayOffset === 0 && weekday === currentWeekday;

    for (const period of orderedPeriods) {
      if (isSameDay) {
        const periodStart = PERIODS[period].start;
        if (periodStart <= currentTimeStr) {
          continue;
        }
      }

      const timeSlotKey = `${weekday}-${period}` as TimeSlotKey;
      const slotId = activeSchedule.grid[timeSlotKey];
      if (!slotId) {
        continue;
      }

      const slot = activeSchedule.slots[slotId];
      if (!slot) {
        continue;
      }

      const exception = getExceptionForSlot(activeSchedule, slotId, dateStr);
      if (exception && exception.type === "cancellation") {
        continue;
      }

      return {
        courseId: slot.courseId,
        timeSlotKey,
        status: "next",
      };
    }

    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  return null;
}

/**
 * Check if a time is within the "current class" window
 * This includes the class time + break time until the next class starts
 */
function isInCurrentClassWindow(time: Date, period: Period): boolean {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  const periodInfo = PERIODS[period];
  if (!periodInfo) return false;

  // Get the next period to determine the break time
  const nextPeriod = (period + 1) as Period;
  const nextPeriodInfo = PERIODS[nextPeriod];

  // If there's a next period, the window extends until the next period starts
  const windowEnd = nextPeriodInfo ? nextPeriodInfo.start : periodInfo.end;

  return timeStr >= periodInfo.start && timeStr < windowEnd;
}

/**
 * Get the current and next class from the active schedule
 */
export function getCurrentAndNextClass(
  store: ScheduleStore,
  activeScheduleId: string | null,
  currentTime: Date = new Date(),
): { current: CurrentClassInfo | null; next: CurrentClassInfo | null } {
  if (!activeScheduleId) {
    return { current: null, next: null };
  }

  const activeSchedule = store.schedules[activeScheduleId];
  if (!activeSchedule) {
    return { current: null, next: null };
  }

  const currentWeekday = getCurrentWeekday(currentTime);
  if (!currentWeekday) {
    // Sunday - no classes
    return { current: null, next: null };
  }

  const todayStr = currentTime.toISOString().split("T")[0];

  // Find current class
  let currentClass: CurrentClassInfo | null = null;
  const currentPeriod = getPeriodForTime(currentTime);

  if (currentPeriod !== null) {
    // Check if we're in the "current class window" (class time + break)
    if (isInCurrentClassWindow(currentTime, currentPeriod)) {
      const timeSlotKey = `${currentWeekday}-${currentPeriod}` as TimeSlotKey;
      const slotId = activeSchedule.grid[timeSlotKey];

      if (slotId) {
        const slot = activeSchedule.slots[slotId];
        if (slot) {
          // Check for exceptions (cancellations)
          const exception = getExceptionForSlot(activeSchedule, slotId, todayStr);
          if (!exception || exception.type !== "cancellation") {
            currentClass = {
              courseId: slot.courseId,
              timeSlotKey,
              status: "current",
            };
          }
        }
      }
    }
  }

  // Find next class
  let nextClass: CurrentClassInfo | null = null;
  const nextClassInfo = findNextClass(activeSchedule, currentWeekday, currentTime);
  if (nextClassInfo) {
    nextClass = nextClassInfo;
  }

  return { current: currentClass, next: nextClass };
}

/**
 * Get the class status for a specific course
 */
export function getClassStatusForCourse(
  store: ScheduleStore,
  activeScheduleId: string | null,
  courseId: string,
  currentTime: Date = new Date(),
): ClassStatus {
  const { current, next } = getCurrentAndNextClass(store, activeScheduleId, currentTime);

  if (current?.courseId === courseId) {
    return "current";
  }
  if (next?.courseId === courseId) {
    return "next";
  }
  return null;
}

/**
 * Get the MOOCS URLs for current and next classes
 */
export function getCurrentAndNextClassUrls(
  store: ScheduleStore,
  activeScheduleId: string | null,
  currentTime: Date = new Date(),
): { current: string | null; next: string | null } {
  const { current, next } = getCurrentAndNextClass(store, activeScheduleId, currentTime);

  const currentUrl = current ? store.courses[current.courseId]?.urls?.moocs ?? null : null;
  const nextUrl = next ? store.courses[next.courseId]?.urls?.moocs ?? null : null;

  return { current: currentUrl, next: nextUrl };
}

/**
 * Normalize MOOCS URL to compare URLs
 * Removes protocol, trailing slashes, and query parameters
 */
function normalizeMoocsUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, "") // Remove protocol
    .replace(/\/$/, "") // Remove trailing slash
    .split("?")[0]; // Remove query parameters
}

/**
 * Check if a URL matches the current or next class
 */
export function getClassStatusByUrl(
  store: ScheduleStore,
  activeScheduleId: string | null,
  moocsUrl: string,
  currentTime: Date = new Date(),
): ClassStatus {
  const { current, next } = getCurrentAndNextClassUrls(store, activeScheduleId, currentTime);

  const normalizedInput = normalizeMoocsUrl(moocsUrl);

  if (current && normalizeMoocsUrl(current) === normalizedInput) {
    return "current";
  }
  if (next && normalizeMoocsUrl(next) === normalizedInput) {
    return "next";
  }
  return null;
}
