import { useState, useEffect, type CSSProperties } from "react";
import type { Course, Offering, Schedule, Weekday, Period } from "../../types";
import { useScheduleStore } from "../../hooks/schedule/useScheduleStore";
import { useStorageManager } from "../../storage/context";
import { ScheduleSelector } from "./ScheduleSelector";
import { ScheduleGrid } from "./ScheduleGrid";
import { CourseEditModal } from "./CourseEditModal";
import {
  getOfferingsByWeekdayAndPeriod,
  addCourse,
  addOffering,
  addOfferingToSchedule,
} from "../../utils/schedule";

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
  },
  header: {
    fontSize: "1.5rem",
    fontWeight: 700,
    marginBottom: "1rem",
    color: "#1f2937",
  },
  loading: {
    padding: "2rem",
    textAlign: "center",
    color: "#6b7280",
  },
  noSchedule: {
    padding: "2rem",
    textAlign: "center",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
  },
};

export const ScheduleEditor = () => {
  const {
    store,
    isLoading,
    updateCourse,
    deleteCourse,
    updateOffering,
    deleteOffering,
    createSchedule,
    removeOfferingFromSchedule,
  } = useScheduleStore();

  const storageManager = useStorageManager();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [editingCell, setEditingCell] = useState<{
    weekday: Weekday;
    period: Period;
  } | null>(null);

  // Auto-select first schedule if none selected
  const schedules = Object.values(store.schedules);

  // Use useEffect to avoid infinite loop
  useEffect(() => {
    if (!selectedScheduleId && schedules.length > 0 && !isLoading) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules.length, isLoading, selectedScheduleId]);

  // Get the current selected schedule from store (always up-to-date)
  const selectedSchedule = selectedScheduleId
    ? store.schedules[selectedScheduleId]
    : null;

  console.log("[ScheduleEditor] Current state:", {
    selectedScheduleId,
    selectedSchedule,
    selectedScheduleOfferingIds: selectedSchedule?.offeringIds,
    storeSchedules: store.schedules,
    storeCourses: Object.keys(store.courses),
    storeOfferings: Object.keys(store.offerings),
  });

  const handleCreateSchedule = async (schedule: Schedule) => {
    await createSchedule(schedule);
    setSelectedScheduleId(schedule.id);
  };

  const handleCellClick = (weekday: Weekday, period: Period) => {
    setEditingCell({ weekday, period });
  };

  const handleSave = async (course: Course, offering: Offering) => {
    if (!selectedSchedule) {
      console.error("No schedule selected");
      alert("時間割が選択されていません");
      return;
    }

    try {
      console.log("Saving course and offering:", { course, offering, selectedSchedule });

      // Check if this is an update or create
      const existingOffering = getOfferingsByWeekdayAndPeriod(
        store,
        selectedSchedule.id,
        editingCell!.weekday,
        editingCell!.period,
      );

      if (existingOffering) {
        console.log("Updating existing offering");
        // Update existing course and offering
        await updateCourse(course.id, course);
        await updateOffering(offering.id, offering);
      } else {
        console.log("Creating new course and offering");
        // Create new course, offering, and add to schedule in one operation
        // Build the complete new store state
        let newStore = addCourse(store, course);
        console.log("After addCourse:", newStore);
        newStore = addOffering(newStore, offering);
        console.log("After addOffering:", newStore);
        newStore = addOfferingToSchedule(newStore, selectedSchedule.id, offering.id);
        console.log("After addOfferingToSchedule:", newStore);

        // Save the complete new store state
        await storageManager.saveScheduleStore(newStore);
        console.log("All changes saved to storage");
      }

      console.log("Save completed successfully");
      setEditingCell(null);
    } catch (error) {
      console.error("Save error:", error);
      alert(
        error instanceof Error ? error.message : "保存に失敗しました",
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule || !editingCell) return;

    const offering = getOfferingsByWeekdayAndPeriod(
      store,
      selectedSchedule.id,
      editingCell.weekday,
      editingCell.period,
    );

    if (!offering) return;

    if (
      !confirm(
        "この授業を削除してもよろしいですか？\n他の時間割でも使用している場合、そちらも削除されます。",
      )
    ) {
      return;
    }

    try {
      await removeOfferingFromSchedule(selectedSchedule.id, offering.id);
      await deleteOffering(offering.id);

      // Check if this course is used in any other offering
      const otherOfferings = Object.values(store.offerings).filter(
        (o) => o.courseId === offering.courseId && o.id !== offering.id,
      );

      // If no other offerings use this course, delete it
      if (otherOfferings.length === 0) {
        await deleteCourse(offering.courseId);
      }

      setEditingCell(null);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "削除に失敗しました",
      );
    }
  };

  const handleCloseModal = () => {
    setEditingCell(null);
  };

  if (isLoading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>時間割編集</h2>

      <ScheduleSelector
        store={store}
        selectedSchedule={selectedSchedule}
        onSelectSchedule={setSelectedScheduleId}
        onCreateSchedule={handleCreateSchedule}
      />

      {selectedSchedule ? (
        <ScheduleGrid
          store={store}
          schedule={selectedSchedule}
          onCellClick={handleCellClick}
        />
      ) : (
        <div style={styles.noSchedule}>
          時間割を選択または作成してください
        </div>
      )}

      {editingCell && selectedSchedule && (
        <CourseEditModal
          weekday={editingCell.weekday}
          period={editingCell.period}
          existingOffering={getOfferingsByWeekdayAndPeriod(
            store,
            selectedSchedule.id,
            editingCell.weekday,
            editingCell.period,
          )}
          existingCourse={
            getOfferingsByWeekdayAndPeriod(
              store,
              selectedSchedule.id,
              editingCell.weekday,
              editingCell.period,
            )
              ? store.courses[
                  getOfferingsByWeekdayAndPeriod(
                    store,
                    selectedSchedule.id,
                    editingCell.weekday,
                    editingCell.period,
                  )!.courseId
                ]
              : undefined
          }
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
