import { useEffect, useState } from "react";
import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import { SettingsModal } from "./SettingsModal";

interface SettingsManagerProps {
  storageManager: StorageManager;
}

// グローバルな設定モーダル状態セッター
declare global {
  interface Window {
    __mikotoRegisterSettingsModalSetter?: (setter: (open: boolean) => void) => void;
  }
}

export const SettingsManager = ({ storageManager }: SettingsManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // setterを登録してmain.tsxから呼び出せるようにする
    if (window.__mikotoRegisterSettingsModalSetter) {
      window.__mikotoRegisterSettingsModalSetter(setIsOpen);
    }
  }, []);

  return (
    <SettingsModal
      storageManager={storageManager}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
};
