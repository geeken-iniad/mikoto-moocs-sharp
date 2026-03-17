/**
 * Reactive store factory for bridging async storage adapters with
 * React's useSyncExternalStore.
 *
 * Pattern: async hydrate → sync cached read (getSnapshot/subscribe)
 */
import type { GenericSchema } from "valibot";
import type { IStorageAdapter } from "./interface";
import { safeParse } from "./schemas";

export interface ReactiveStore<T> {
  /** Synchronous snapshot for useSyncExternalStore */
  getSnapshot(): T;
  /** Subscribe to changes */
  subscribe(callback: () => void): () => void;
  /** Async: update the value (persists + notifies) */
  set(value: T): Promise<void>;
  /** Async: hydrate from storage (call once at bootstrap) */
  hydrate(): Promise<void>;
}

/**
 * Create a reactive store for a single storage key.
 * Bridges async IStorageAdapter with sync React reads via cached snapshot.
 */
export function createReactiveStore<T>(
  adapter: IStorageAdapter,
  key: string,
  schema: GenericSchema<T>,
  defaultValue: T,
): ReactiveStore<T> {
  let cached: T = defaultValue;
  const subscribers = new Set<() => void>();

  function notify() {
    for (const cb of subscribers) {
      cb();
    }
  }

  function decodeOrDefault(raw: unknown): T {
    if (raw == null) return defaultValue;
    const result = safeParse(schema, raw);
    if (result.success) return result.data;
    console.warn(
      `[ReactiveStore] Validation failed for key "${key}":`,
      result.error,
    );
    return defaultValue;
  }

  // Watch for external changes (other tabs, background script)
  adapter.watch<unknown>(key, (newValue) => {
    cached = decodeOrDefault(newValue);
    notify();
  });

  return {
    getSnapshot() {
      return cached;
    },

    subscribe(callback) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },

    async set(value) {
      cached = value;
      notify();
      await adapter.setItem(key, value);
    },

    async hydrate() {
      const raw = await adapter.getItem<unknown>(key);
      cached = decodeOrDefault(raw);
      notify();
    },
  };
}
