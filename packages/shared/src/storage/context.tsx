import { createContext, type ReactNode, useContext } from "react";

import type { StorageManager } from "./manager";

const StorageManagerContext = createContext<StorageManager | null>(null);

export interface StorageProviderProps {
  storageManager: StorageManager;
  children: ReactNode;
}

/**
 * Provide a StorageManager instance to descendants.
 */
export const StorageProvider = ({
  storageManager,
  children,
}: StorageProviderProps) => (
  <StorageManagerContext.Provider value={storageManager}>
    {children}
  </StorageManagerContext.Provider>
);

/**
 * Access the current StorageManager from context.
 */
export const useStorageManager = (): StorageManager => {
  const storageManager = useContext(StorageManagerContext);

  if (!storageManager) {
    throw new Error("StorageManager is not available in context.");
  }

  return storageManager;
};
