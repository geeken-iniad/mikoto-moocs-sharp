import { useSyncExternalStore } from "react";
import type { ReactiveStore } from "../storage/createReactiveStore";

/**
 * React hook that subscribes to a ReactiveStore via useSyncExternalStore.
 * Returns the current snapshot value, re-rendering on changes.
 */
export function useStore<T>(store: ReactiveStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot);
}
