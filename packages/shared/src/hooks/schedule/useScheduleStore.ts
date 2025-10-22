import { useEffect, useState } from "react";
import type {
  ScheduleStore,
  Course,
  ScheduleSlot,
  Schedule,
  TimeSlotKey,
  ExceptionEntry,
} from "../../types";
import { useStorageManager } from "../../storage/context";
import type { StorageManager } from "../../storage/manager";
import {
  addCourse,
  updateCourse,
  deleteCourse,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  duplicateSchedule,
  addSlot,
  moveSlot,
  updateSlot,
  removeSlot,
  addException,
  updateException,
  removeException,
  createScheduleStore,
  validateStore,
} from "../../utils/schedule";

const useScheduleStoreInternal = (storageManager: StorageManager) => {
  const [store, setStore] = useState<ScheduleStore>(createScheduleStore());
  const [isLoading, setIsLoading] = useState(true);

  // Load store from storage on mount
  useEffect(() => {
    const loadStore = async () => {
      setIsLoading(true);
      const savedStore = await storageManager.getScheduleStore();

      // Check if store has old format (missing grid/slots/exceptions)
      let storeToUse = savedStore;
      const hasOldFormat = Object.values(savedStore.schedules).some(
        (schedule) => !schedule.grid || !schedule.slots || !schedule.exceptions
      );

      if (hasOldFormat) {
        console.warn("[useScheduleStore] Old format detected, resetting to empty store");
        storeToUse = {
          schemaVersion: 1,
          courses: {},
          schedules: {},
        };
        // Save the reset store
        await storageManager.saveScheduleStore(storeToUse);
      } else {
        // Validate loaded store
        const errors = validateStore(storeToUse);
        if (errors.length > 0) {
          console.warn("[useScheduleStore] Validation errors on load:", errors);
        }
      }

      setStore(storeToUse);
      setIsLoading(false);
    };
    loadStore();
  }, [storageManager]);

  // Watch for changes from other tabs/windows
  useEffect(() => {
    const unwatch = storageManager.watchScheduleStore((newStore) => {
      if (newStore) {
        setStore(newStore);
      }
    });
    return unwatch;
  }, [storageManager]);

  // Save store to storage
  const saveStore = async (newStore: ScheduleStore) => {
    console.log("[useScheduleStore] saveStore called with:", newStore);

    // Validate before saving
    const errors = validateStore(newStore);
    if (errors.length > 0) {
      console.error("[useScheduleStore] Validation errors before save:", errors);
      throw new Error(`Validation failed: ${errors.map((e) => e.message).join(", ")}`);
    }

    setStore(newStore);
    console.log("[useScheduleStore] Local state updated");
    await storageManager.saveScheduleStore(newStore);
    console.log("[useScheduleStore] Storage manager save completed");
  };

  // ========================================
  // Course operations
  // ========================================

  const createCourse = async (course: Course) => {
    console.log("[useScheduleStore] Creating course:", course);
    const newStore = addCourse(store, course);
    await saveStore(newStore);
    return course;
  };

  const updateCourseById = async (courseId: string, updates: Partial<Course>) => {
    console.log("[useScheduleStore] Updating course:", courseId, updates);
    const newStore = updateCourse(store, courseId, updates);
    await saveStore(newStore);
  };

  const deleteCourseById = async (courseId: string) => {
    console.log("[useScheduleStore] Deleting course:", courseId);
    const newStore = deleteCourse(store, courseId);
    await saveStore(newStore);
  };

  // ========================================
  // Schedule operations
  // ========================================

  const createSchedule = async (schedule: Schedule) => {
    console.log("[useScheduleStore] Creating schedule:", schedule);
    const newStore = addSchedule(store, schedule);
    await saveStore(newStore);
    return schedule;
  };

  const updateScheduleById = async (
    scheduleId: string,
    updates: Partial<Schedule>,
  ) => {
    console.log("[useScheduleStore] Updating schedule:", scheduleId, updates);
    const newStore = updateSchedule(store, scheduleId, updates);
    await saveStore(newStore);
  };

  const deleteScheduleById = async (scheduleId: string) => {
    console.log("[useScheduleStore] Deleting schedule:", scheduleId);
    const newStore = deleteSchedule(store, scheduleId);
    await saveStore(newStore);
  };

  const duplicateScheduleById = async (
    sourceScheduleId: string,
    newAcademicYear: number,
    newTermInfo: { semester: "Spring" | "Fall"; division: "Semester" | 1 | 2 | 3 | 4 },
  ) => {
    console.log("[useScheduleStore] Duplicating schedule:", sourceScheduleId);
    const newStore = duplicateSchedule(
      store,
      sourceScheduleId,
      newAcademicYear,
      newTermInfo,
    );
    await saveStore(newStore);
  };

  // ========================================
  // ScheduleSlot operations
  // ========================================

  const addSlotToSchedule = async (
    scheduleId: string,
    timeSlot: TimeSlotKey,
    courseId: string,
    overrides?: Partial<Omit<ScheduleSlot, "id" | "courseId">>,
  ) => {
    console.log("[useScheduleStore] Adding slot to schedule:", {
      scheduleId,
      timeSlot,
      courseId,
    });
    const newStore = addSlot(store, scheduleId, timeSlot, courseId, overrides);
    await saveStore(newStore);
  };

  const moveSlotInSchedule = async (
    scheduleId: string,
    from: TimeSlotKey,
    to: TimeSlotKey,
  ) => {
    console.log("[useScheduleStore] Moving slot:", { scheduleId, from, to });
    const newStore = moveSlot(store, scheduleId, from, to);
    await saveStore(newStore);
  };

  const updateSlotInSchedule = async (
    scheduleId: string,
    slotId: string,
    updates: Partial<Omit<ScheduleSlot, "id">>,
  ) => {
    console.log("[useScheduleStore] Updating slot:", { scheduleId, slotId, updates });
    const newStore = updateSlot(store, scheduleId, slotId, updates);
    await saveStore(newStore);
  };

  const removeSlotFromSchedule = async (
    scheduleId: string,
    timeSlot: TimeSlotKey,
  ) => {
    console.log("[useScheduleStore] Removing slot:", { scheduleId, timeSlot });
    const newStore = removeSlot(store, scheduleId, timeSlot);
    await saveStore(newStore);
  };

  // ========================================
  // Exception operations
  // ========================================

  const addExceptionToSchedule = async (
    scheduleId: string,
    exception: ExceptionEntry,
  ) => {
    console.log("[useScheduleStore] Adding exception:", { scheduleId, exception });
    const newStore = addException(store, scheduleId, exception);
    await saveStore(newStore);
  };

  const updateExceptionInSchedule = async (
    scheduleId: string,
    exceptionId: string,
    updates: Partial<Omit<ExceptionEntry, "id" | "slotId" | "date">>,
  ) => {
    console.log("[useScheduleStore] Updating exception:", {
      scheduleId,
      exceptionId,
      updates,
    });
    const newStore = updateException(store, scheduleId, exceptionId, updates);
    await saveStore(newStore);
  };

  const removeExceptionFromSchedule = async (
    scheduleId: string,
    exceptionId: string,
  ) => {
    console.log("[useScheduleStore] Removing exception:", {
      scheduleId,
      exceptionId,
    });
    const newStore = removeException(store, scheduleId, exceptionId);
    await saveStore(newStore);
  };

  return {
    store,
    isLoading,
    // Course operations
    createCourse,
    updateCourse: updateCourseById,
    deleteCourse: deleteCourseById,
    // Schedule operations
    createSchedule,
    updateSchedule: updateScheduleById,
    deleteSchedule: deleteScheduleById,
    duplicateSchedule: duplicateScheduleById,
    // ScheduleSlot operations
    addSlot: addSlotToSchedule,
    moveSlot: moveSlotInSchedule,
    updateSlot: updateSlotInSchedule,
    removeSlot: removeSlotFromSchedule,
    // Exception operations
    addException: addExceptionToSchedule,
    updateException: updateExceptionInSchedule,
    removeException: removeExceptionFromSchedule,
  };
};

export const createUseScheduleStore = (storageManager: StorageManager) => {
  return () => useScheduleStoreInternal(storageManager);
};

export const useScheduleStore = () => {
  const storageManager = useStorageManager();
  return useScheduleStoreInternal(storageManager);
};
