import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useScheduleStore } from "../../hooks/schedule/useScheduleStore";
import { useStorageManager } from "../../storage/context";
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
} from "../../styles/commonStyles";
import type {
  Course,
  Period,
  Schedule,
  ScheduleSlot,
  Weekday,
} from "../../types";
import { createTimeSlotKey } from "../../utils/schedule";
import { ScheduleGrid } from "./ScheduleGrid";
import { ScheduleSelector } from "./ScheduleSelector";
import { SlotEditModal } from "./SlotEditModal";

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
  },
  header: {
    fontSize: fontSize["2xl"],
    fontWeight: fontWeight.bold,
    marginBottom: "16px",
    color: colors.textDark,
  },
  loading: {
    padding: "32px",
    textAlign: "center" as const,
    color: colors.textLight,
    fontSize: fontSize.base,
  },
  noSchedule: {
    padding: "32px",
    textAlign: "center" as const,
    color: colors.textLight,
    backgroundColor: colors.bgLight,
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.borderLight}`,
    fontSize: fontSize.base,
  },
};

export const ScheduleEditor = () => {
  const { store, isLoading, createSchedule, addSlot, updateSlot, removeSlot } =
    useScheduleStore();

  const storageManager = useStorageManager();

  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null,
  );
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{
    weekday: Weekday;
    period: Period;
  } | null>(null);

  // Auto-select first schedule if none selected
  const schedules = useMemo(
    () => Object.values(store.schedules),
    [store.schedules],
  );

  // Load active schedule ID on mount
  useEffect(() => {
    const loadActiveSchedule = async () => {
      const activeId = await storageManager.getActiveScheduleId();
      setActiveScheduleId(activeId);
    };
    loadActiveSchedule();
  }, [storageManager]);

  // Watch for changes to active schedule ID
  useEffect(() => {
    const unwatch = storageManager.watchActiveScheduleId((newActiveId) => {
      setActiveScheduleId(newActiveId);
    });
    return unwatch;
  }, [storageManager]);

  // Use useEffect to avoid infinite loop
  useEffect(() => {
    if (!selectedScheduleId && schedules.length > 0 && !isLoading) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, isLoading, selectedScheduleId]);

  // Get the current selected schedule from store (always up-to-date)
  const selectedSchedule = selectedScheduleId
    ? store.schedules[selectedScheduleId]
    : null;

  const handleCreateSchedule = async (schedule: Schedule) => {
    await createSchedule(schedule);
    setSelectedScheduleId(schedule.id);
  };

  const handleSetActive = async (scheduleId: string) => {
    await storageManager.setActiveScheduleId(scheduleId);
    // setActiveScheduleId will be called automatically by the watch callback
  };

  const handleCellClick = (weekday: Weekday, period: Period) => {
    setEditingCell({ weekday, period });
  };

  const handleSaveSlot = async (
    slotData: Partial<Omit<ScheduleSlot, "id">>,
  ) => {
    if (!selectedSchedule || !editingCell) {
      console.error("No schedule or cell selected");
      alert("時間割またはセルが選択されていません");
      return;
    }

    if (!slotData.courseId) {
      alert("科目を選択してください");
      return;
    }

    const timeSlotKey = createTimeSlotKey(
      editingCell.weekday,
      editingCell.period,
    );
    const existingSlotId = selectedSchedule.grid[timeSlotKey];

    try {
      if (existingSlotId) {
        // Update existing slot
        await updateSlot(selectedSchedule.id, existingSlotId, slotData);
      } else {
        // Add new slot
        await addSlot(selectedSchedule.id, timeSlotKey, slotData.courseId, {
          rooms: slotData.rooms,
          defaultDeliveryMode: slotData.defaultDeliveryMode,
          memo: slotData.memo,
          color: slotData.color,
          customInstructors: slotData.customInstructors,
        });
      }
      setEditingCell(null);
    } catch (error) {
      console.error("Failed to save slot:", error);
      alert(
        `保存に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSchedule || !editingCell) {
      return;
    }

    if (!confirm("この授業を削除してもよろしいですか？")) {
      return;
    }

    const timeSlotKey = createTimeSlotKey(
      editingCell.weekday,
      editingCell.period,
    );

    try {
      await removeSlot(selectedSchedule.id, timeSlotKey);
      setEditingCell(null);
    } catch (error) {
      console.error("Failed to delete slot:", error);
      alert(
        `削除に失敗しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      );
    }
  };

  if (isLoading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  const courses = Object.values(store.courses);

  // Get existing slot and course for editing
  let existingSlot: ScheduleSlot | undefined;
  let existingCourse: Course | undefined;

  if (editingCell && selectedSchedule) {
    const timeSlotKey = createTimeSlotKey(
      editingCell.weekday,
      editingCell.period,
    );
    const slotId = selectedSchedule.grid[timeSlotKey];
    if (slotId) {
      existingSlot = selectedSchedule.slots[slotId];
      if (existingSlot) {
        existingCourse = store.courses[existingSlot.courseId];
      }
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>時間割管理</h1>

      <ScheduleSelector
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        activeScheduleId={activeScheduleId}
        onSelectSchedule={setSelectedScheduleId}
        onSetActive={handleSetActive}
        onCreateSchedule={handleCreateSchedule}
      />

      {selectedSchedule ? (
        <ScheduleGrid
          store={store}
          schedule={selectedSchedule}
          onCellClick={handleCellClick}
        />
      ) : (
        <div style={styles.noSchedule}>時間割を作成してください</div>
      )}

      {editingCell && (
        <SlotEditModal
          courses={courses}
          existingSlot={existingSlot}
          existingCourse={existingCourse}
          onSave={handleSaveSlot}
          onDelete={existingSlot ? handleDeleteSlot : undefined}
          onClose={() => setEditingCell(null)}
        />
      )}
    </div>
  );
};
