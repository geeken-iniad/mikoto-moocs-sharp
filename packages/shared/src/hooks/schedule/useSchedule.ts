import { useEffect, useState } from "react";

import type { Class, DayOfWeek, Schedule, EditingCell } from "../../types";
import { PERIODS } from "../../constants";
import type { StorageManager } from "../../storage/manager";
import { useScheduleHistory } from "./useScheduleHistory";

export const createUseSchedule = (storageManager: StorageManager) => {
  return () => {
    const [schedule, setSchedule] = useState<Schedule>({});
    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const { history, addToHistory } = useScheduleHistory(storageManager);

    useEffect(() => {
      const loadSchedule = async () => {
        const result = await storageManager.getSchedule();
        setSchedule(result);
      };
      loadSchedule();
    }, []);

    const saveSchedule = async (newSchedule: Schedule) => {
      setSchedule(newSchedule);
      await storageManager.saveSchedule(newSchedule);
    };

    const getClassForCell = (
      day: DayOfWeek,
      periodIndex: number,
    ): Class | null => {
      const classes = schedule[day] || [];
      const period = PERIODS[periodIndex];
      return (
        classes.find(
          (c) => c.period.start === period.start && c.period.end === period.end,
        ) || null
      );
    };

    const handleCellClick = (day: DayOfWeek, periodIndex: number) => {
      const existingClass = getClassForCell(day, periodIndex);
      const period = PERIODS[periodIndex];

      setEditingCell({ day, periodIndex });
      setEditingClass(
        existingClass || {
          subject: "",
          teacher: "",
          room: "",
          period: { start: period.start, end: period.end },
        },
      );
    };

    const handleSave = () => {
      if (!editingCell || !editingClass) return;

      const newSchedule = { ...schedule };
      if (!newSchedule[editingCell.day]) {
        newSchedule[editingCell.day] = [];
      }

      const existingIndex = newSchedule[editingCell.day]?.findIndex(
        (c) =>
          c.period.start === editingClass.period.start &&
          c.period.end === editingClass.period.end,
      );

      if (editingClass.subject.trim() === "") {
        if (existingIndex !== undefined && existingIndex !== -1) {
          newSchedule[editingCell.day] = newSchedule[editingCell.day]?.filter(
            (_, i) => i !== existingIndex,
          );
        }
      } else {
        if (existingIndex !== undefined && existingIndex !== -1) {
          newSchedule[editingCell.day] =
            newSchedule[editingCell.day]?.map((c, i) =>
              i === existingIndex ? editingClass : c,
            ) || [];
        } else {
          newSchedule[editingCell.day] = [
            ...(newSchedule[editingCell.day] || []),
            editingClass,
          ];
        }
      }

      saveSchedule(newSchedule);
      addToHistory(
        editingClass.subject,
        editingClass.teacher,
        editingClass.room,
      );
      setEditingCell(null);
      setEditingClass(null);
    };

    const handleCancel = () => {
      setEditingCell(null);
      setEditingClass(null);
    };

    const handleDelete = () => {
      if (!editingCell || !editingClass) return;

      const newSchedule = { ...schedule };
      if (newSchedule[editingCell.day]) {
        newSchedule[editingCell.day] = newSchedule[editingCell.day]?.filter(
          (c) =>
            !(
              c.period.start === editingClass.period.start &&
              c.period.end === editingClass.period.end
            ),
        );
      }

      saveSchedule(newSchedule);
      setEditingCell(null);
      setEditingClass(null);
    };

    return {
      schedule,
      editingCell,
      editingClass,
      setEditingClass,
      getClassForCell,
      handleCellClick,
      handleSave,
      handleCancel,
      handleDelete,
      history,
    };
  };
};
