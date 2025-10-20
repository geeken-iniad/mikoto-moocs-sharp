import { useEffect, useState } from "react";
import type {
  ScheduleStore,
  Course,
  Offering,
  Schedule,
} from "../../types";
import { useStorageManager } from "../../storage/context";
import type { StorageManager } from "../../storage/manager";
import {
  addCourse,
  addOffering,
  addSchedule,
  addOfferingToSchedule,
  removeOfferingFromSchedule,
  createScheduleStore,
} from "../../utils/schedule";

const useScheduleStoreInternal = (storageManager: StorageManager) => {
  const [store, setStore] = useState<ScheduleStore>(createScheduleStore());
  const [isLoading, setIsLoading] = useState(true);

  // Load store from storage on mount
  useEffect(() => {
    const loadStore = async () => {
      setIsLoading(true);
      const savedStore = await storageManager.getScheduleStore();
      setStore(savedStore);
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
    setStore(newStore);
    console.log("[useScheduleStore] Local state updated");
    await storageManager.saveScheduleStore(newStore);
    console.log("[useScheduleStore] Storage manager save completed");
  };

  // Course operations
  const createCourse = async (course: Course) => {
    console.log("[useScheduleStore] Creating course:", course);
    console.log("[useScheduleStore] Current store before adding course:", store);
    const newStore = addCourse(store, course);
    console.log("[useScheduleStore] New store after adding course:", newStore);
    await saveStore(newStore);
    console.log("[useScheduleStore] Course saved to storage");
    return course;
  };

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    const existingCourse = store.courses[courseId];
    if (!existingCourse) {
      throw new Error(`Course not found: ${courseId}`);
    }
    const updatedCourse = { ...existingCourse, ...updates };
    const newStore = addCourse(store, updatedCourse);
    await saveStore(newStore);
    return updatedCourse;
  };

  const deleteCourse = async (courseId: string) => {
    // Remove all offerings associated with this course
    const offeringsToRemove = Object.values(store.offerings).filter(
      (o) => o.courseId === courseId,
    );

    let newStore = { ...store };

    // Remove offerings from all schedules
    for (const offering of offeringsToRemove) {
      Object.keys(newStore.schedules).forEach((scheduleId) => {
        newStore = removeOfferingFromSchedule(newStore, scheduleId, offering.id);
      });
      // Remove offering from store
      const { [offering.id]: _, ...remainingOfferings } = newStore.offerings;
      newStore = { ...newStore, offerings: remainingOfferings };
    }

    // Remove course from store
    const { [courseId]: __, ...remainingCourses } = newStore.courses;
    newStore = { ...newStore, courses: remainingCourses };

    await saveStore(newStore);
  };

  // Offering operations
  const createOffering = async (offering: Offering) => {
    console.log("[useScheduleStore] Creating offering:", offering);
    console.log("[useScheduleStore] Current store before adding offering:", store);
    const newStore = addOffering(store, offering);
    console.log("[useScheduleStore] New store after adding offering:", newStore);
    await saveStore(newStore);
    console.log("[useScheduleStore] Offering saved to storage");
    return offering;
  };

  const updateOffering = async (
    offeringId: string,
    updates: Partial<Offering>,
  ) => {
    const existingOffering = store.offerings[offeringId];
    if (!existingOffering) {
      throw new Error(`Offering not found: ${offeringId}`);
    }
    const updatedOffering = { ...existingOffering, ...updates };
    const newStore = addOffering(store, updatedOffering);
    await saveStore(newStore);
    return updatedOffering;
  };

  const deleteOffering = async (offeringId: string) => {
    let newStore = { ...store };

    // Remove offering from all schedules
    Object.keys(newStore.schedules).forEach((scheduleId) => {
      newStore = removeOfferingFromSchedule(newStore, scheduleId, offeringId);
    });

    // Remove offering from store
    const { [offeringId]: _, ...remainingOfferings } = newStore.offerings;
    newStore = { ...newStore, offerings: remainingOfferings };

    await saveStore(newStore);
  };

  // Schedule operations
  const createSchedule = async (schedule: Schedule) => {
    const newStore = addSchedule(store, schedule);
    await saveStore(newStore);
    return schedule;
  };

  const updateSchedule = async (
    scheduleId: string,
    updates: Partial<Schedule>,
  ) => {
    const existingSchedule = store.schedules[scheduleId];
    if (!existingSchedule) {
      throw new Error(`Schedule not found: ${scheduleId}`);
    }
    const updatedSchedule = { ...existingSchedule, ...updates };
    const newStore = addSchedule(store, updatedSchedule);
    await saveStore(newStore);
    return updatedSchedule;
  };

  const deleteSchedule = async (scheduleId: string) => {
    const { [scheduleId]: _, ...remainingSchedules } = store.schedules;
    const newStore = { ...store, schedules: remainingSchedules };
    await saveStore(newStore);
  };

  const addOfferingToScheduleById = async (
    scheduleId: string,
    offeringId: string,
  ) => {
    console.log("[useScheduleStore] Adding offering to schedule:", { scheduleId, offeringId });
    console.log("[useScheduleStore] Current store.schedules[scheduleId]:", store.schedules[scheduleId]);
    console.log("[useScheduleStore] Current offeringIds:", store.schedules[scheduleId]?.offeringIds);
    const newStore = addOfferingToSchedule(store, scheduleId, offeringId);
    console.log("[useScheduleStore] New store.schedules[scheduleId]:", newStore.schedules[scheduleId]);
    console.log("[useScheduleStore] New offeringIds:", newStore.schedules[scheduleId]?.offeringIds);
    await saveStore(newStore);
    console.log("[useScheduleStore] Saved to storage");
  };

  const removeOfferingFromScheduleById = async (
    scheduleId: string,
    offeringId: string,
  ) => {
    const newStore = removeOfferingFromSchedule(store, scheduleId, offeringId);
    await saveStore(newStore);
  };

  return {
    store,
    isLoading,
    // Course operations
    createCourse,
    updateCourse,
    deleteCourse,
    // Offering operations
    createOffering,
    updateOffering,
    deleteOffering,
    // Schedule operations
    createSchedule,
    updateSchedule,
    deleteSchedule,
    addOfferingToSchedule: addOfferingToScheduleById,
    removeOfferingFromSchedule: removeOfferingFromScheduleById,
  };
};

export const createUseScheduleStore = (storageManager: StorageManager) => {
  return () => useScheduleStoreInternal(storageManager);
};

export const useScheduleStore = () => {
  const storageManager = useStorageManager();
  return useScheduleStoreInternal(storageManager);
};
