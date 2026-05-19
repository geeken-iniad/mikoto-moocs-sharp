import { useEffect, useRef, useState } from "react";
import type { CampusId } from "../../schedule/types";
import { useStorageManager } from "../../storage/context";

export function useCourseFormDefaults() {
  const storageManager = useStorageManager();
  const isMountedRef = useRef(true);
  const [defaultCampus, setDefaultCampus] = useState<CampusId | undefined>(
    undefined,
  );
  const [availableInstructors, setAvailableInstructors] = useState<string[]>(
    [],
  );

  useEffect(() => {
    let isActive = true;
    isMountedRef.current = true;

    const loadSettings = async () => {
      const settings = await storageManager.getCampusSettings();
      const instructors = await storageManager.getInstructors();
      if (!isActive || !isMountedRef.current) return;

      setDefaultCampus(settings.defaultCampus);
      setAvailableInstructors(instructors);
    };

    loadSettings();

    return () => {
      isActive = false;
      isMountedRef.current = false;
    };
  }, [storageManager]);

  const addInstructors = async (newInstructors: string[]) => {
    await storageManager.addInstructors(newInstructors);
    const instructors = await storageManager.getInstructors();
    if (!isMountedRef.current) return;
    setAvailableInstructors(instructors);
  };

  return { defaultCampus, availableInstructors, addInstructors };
}
