import { describe, expect, it, vi } from "vitest";
import {
  createDefaultKeyboardShortcuts,
  createDefaultNotificationSettings,
  createDefaultScheduleStore,
  mergeUniqueSortedStrings,
} from "./defaults";
import type {
  IStorageAdapter,
  StorageUnwatchFunction,
  StorageWatchCallback,
} from "./interface";
import { STORAGE_KEYS } from "./keys";
import { StorageManager } from "./manager";

class InMemoryStorageAdapter implements IStorageAdapter {
  readonly values = new Map<string, unknown>();
  readonly removeItem = vi.fn(async (key: string) => {
    this.values.delete(key);
  });
  readonly watchedKeys: string[] = [];

  async getItem<T>(key: string): Promise<T | null> {
    return (this.values.get(key) as T | undefined) ?? null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.values.set(key, value);
  }

  watch<T>(
    key: string,
    _callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction {
    this.watchedKeys.push(key);
    return vi.fn();
  }
}

describe("storage domain", () => {
  it("keeps storage key values unique and stable", () => {
    expect(STORAGE_KEYS.SCHEDULE_STORE).toBe("mikoto-schedule-store");
    expect(STORAGE_KEYS.ACTIVE_SCHEDULE_ID).toBe("mikoto-active-schedule-id");
    expect(new Set(Object.values(STORAGE_KEYS)).size).toBe(
      Object.values(STORAGE_KEYS).length,
    );
  });

  it("creates fresh default objects", () => {
    const firstStore = createDefaultScheduleStore();
    const secondStore = createDefaultScheduleStore();
    firstStore.instructors?.push("Alice");

    expect(secondStore).toEqual({
      schemaVersion: 1,
      courses: {},
      schedules: {},
      instructors: [],
    });
    expect(createDefaultKeyboardShortcuts()).toEqual({
      submitShortcut: false,
      numberKeyShortcut: false,
      arrowKeyShortcut: false,
    });
    expect(createDefaultNotificationSettings()).toEqual({
      enabled: false,
      timings: [-10],
    });
  });

  it("merges strings uniquely and sorts them", () => {
    expect(
      mergeUniqueSortedStrings(["Bob", "Alice"], ["Alice", "Carol"]),
    ).toEqual(["Alice", "Bob", "Carol"]);
  });

  it("returns defaults when adapter has no value", async () => {
    const manager = new StorageManager(new InMemoryStorageAdapter());

    await expect(manager.getScheduleStore()).resolves.toEqual(
      createDefaultScheduleStore(),
    );
    await expect(manager.getExtractedSubjects()).resolves.toEqual([]);
    await expect(manager.getDualView()).resolves.toBe(false);
    await expect(manager.getSlideEnhancerEnabled()).resolves.toBe(false);
    await expect(manager.getTheme()).resolves.toBe("light");
    await expect(manager.getKeyboardShortcuts()).resolves.toEqual(
      createDefaultKeyboardShortcuts(),
    );
    await expect(manager.getCampusSettings()).resolves.toEqual({});
    await expect(manager.getNotificationSettings()).resolves.toEqual(
      createDefaultNotificationSettings(),
    );
    await expect(manager.getActiveScheduleId()).resolves.toBeNull();
  });

  it("stores active schedule ids and removes them when set to null", async () => {
    const adapter = new InMemoryStorageAdapter();
    const manager = new StorageManager(adapter);

    await manager.setActiveScheduleId("schedule-1");
    expect(adapter.values.get(STORAGE_KEYS.ACTIVE_SCHEDULE_ID)).toBe(
      "schedule-1",
    );

    await manager.setActiveScheduleId(null);
    expect(adapter.removeItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ACTIVE_SCHEDULE_ID,
    );
    expect(adapter.values.has(STORAGE_KEYS.ACTIVE_SCHEDULE_ID)).toBe(false);
  });

  it("watches the storage key used by a setting", () => {
    const adapter = new InMemoryStorageAdapter();
    const manager = new StorageManager(adapter);

    manager.watchTheme(vi.fn());

    expect(adapter.watchedKeys).toEqual([STORAGE_KEYS.THEME]);
  });
});
