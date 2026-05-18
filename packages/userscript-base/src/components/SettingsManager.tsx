import type { StorageManager } from "@mikoto-moocs-sharp/shared/storage";
import { useCallback, useEffect, useState } from "react";
import { registerSettingsModalHandler } from "../settings/modalController";
import { SettingsModal } from "./SettingsModal";

interface SettingsManagerProps {
  storageManager: StorageManager;
}

export const SettingsManager = ({ storageManager }: SettingsManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unregister = registerSettingsModalHandler(setIsOpen);
    return unregister;
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <SettingsModal
      storageManager={storageManager}
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};
