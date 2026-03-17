import * as v from "valibot";
import { describe, expect, it, vi } from "vitest";
import { createReactiveStore } from "../createReactiveStore";
import type {
  IStorageAdapter,
  StorageUnwatchFunction,
  StorageWatchCallback,
} from "../interface";

/**
 * In-memory adapter for testing.
 */
class InMemoryStorageAdapter implements IStorageAdapter {
  private store = new Map<string, unknown>();
  private watchers = new Map<string, Set<StorageWatchCallback<unknown>>>();

  async getItem<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return (value as T) ?? null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
    const callbacks = this.watchers.get(key);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(value);
      }
    }
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  watch<T>(
    key: string,
    callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    this.watchers.get(key)?.add(callback as StorageWatchCallback<unknown>);
    return () => {
      this.watchers.get(key)?.delete(callback as StorageWatchCallback<unknown>);
    };
  }
}

const ThemeSchema = v.picklist(["light", "dark"]);

describe("createReactiveStore", () => {
  it("returns default value before hydrate", () => {
    const adapter = new InMemoryStorageAdapter();
    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");
    expect(store.getSnapshot()).toBe("light");
  });

  it("hydrates from storage", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem("theme", "dark");

    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");
    await store.hydrate();
    expect(store.getSnapshot()).toBe("dark");
  });

  it("falls back to default on invalid data", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem("theme", "blue"); // invalid

    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");
    await store.hydrate();
    expect(store.getSnapshot()).toBe("light");
  });

  it("set updates cache and persists", async () => {
    const adapter = new InMemoryStorageAdapter();
    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");

    await store.set("dark");
    expect(store.getSnapshot()).toBe("dark");
    expect(await adapter.getItem("theme")).toBe("dark");
  });

  it("notifies subscribers on set", async () => {
    const adapter = new InMemoryStorageAdapter();
    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");

    const callback = vi.fn();
    store.subscribe(callback);

    await store.set("dark");
    // set notifies once directly, watch callback from adapter notifies again
    expect(callback).toHaveBeenCalled();
  });

  it("unsubscribe stops notifications", async () => {
    const adapter = new InMemoryStorageAdapter();
    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");

    const callback = vi.fn();
    const unsub = store.subscribe(callback);
    unsub();

    await store.set("dark");
    expect(callback).not.toHaveBeenCalled();
  });

  it("reacts to external storage changes via watch", async () => {
    const adapter = new InMemoryStorageAdapter();
    const store = createReactiveStore(adapter, "theme", ThemeSchema, "light");

    const callback = vi.fn();
    store.subscribe(callback);

    // Simulate external change (e.g. another tab)
    await adapter.setItem("theme", "dark");

    expect(store.getSnapshot()).toBe("dark");
    expect(callback).toHaveBeenCalled();
  });

  it("works with object schemas", async () => {
    const SettingsSchema = v.object({
      enabled: v.boolean(),
      count: v.number(),
    });
    type Settings = v.InferOutput<typeof SettingsSchema>;

    const adapter = new InMemoryStorageAdapter();
    const defaultVal: Settings = { enabled: false, count: 0 };
    const store = createReactiveStore(
      adapter,
      "settings",
      SettingsSchema,
      defaultVal,
    );

    await store.set({ enabled: true, count: 5 });
    expect(store.getSnapshot()).toEqual({ enabled: true, count: 5 });

    await store.hydrate();
    expect(store.getSnapshot()).toEqual({ enabled: true, count: 5 });
  });
});
