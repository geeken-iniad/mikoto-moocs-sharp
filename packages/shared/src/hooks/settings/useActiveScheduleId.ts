import { useEffect, useState } from "react";
import { useStorageManager } from "../../storage/context";

export function useActiveScheduleId() {
  const storageManager = useStorageManager();
  const [activeScheduleId, setActiveScheduleIdState] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    const loadActiveSchedule = async () => {
      const activeId = await storageManager.getActiveScheduleId();
      if (!isActive) return;
      setActiveScheduleIdState(activeId);
    };

    loadActiveSchedule();

    const unwatch = storageManager.watchActiveScheduleId((newActiveId) => {
      setActiveScheduleIdState(newActiveId);
    });

    return () => {
      isActive = false;
      unwatch();
    };
  }, [storageManager]);

  const setActiveScheduleId = async (scheduleId: string | null) => {
    await storageManager.setActiveScheduleId(scheduleId);
  };

  return { activeScheduleId, setActiveScheduleId };
}
