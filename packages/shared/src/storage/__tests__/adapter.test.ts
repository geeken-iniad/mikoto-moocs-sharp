import { describe, expect, it, vi } from "vitest";
import type {
  IStorageAdapter,
  StorageUnwatchFunction,
  StorageWatchCallback,
} from "../interface";
import { StorageManager } from "../manager";

/**
 * In-memory adapter implementing IStorageAdapter contract.
 * Used to verify StorageManager behavior without platform-specific APIs.
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
    const callbacks = this.watchers.get(key);
    if (callbacks) {
      for (const cb of callbacks) {
        cb(null);
      }
    }
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

// ========================================
// IStorageAdapter Contract Tests
// ========================================

describe("InMemoryStorageAdapter (contract tests)", () => {
  it("returns null for unset keys", async () => {
    const adapter = new InMemoryStorageAdapter();
    expect(await adapter.getItem("nonexistent")).toBeNull();
  });

  it("stores and retrieves values", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem("key", { value: 42 });
    expect(await adapter.getItem("key")).toEqual({ value: 42 });
  });

  it("removes values", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem("key", "value");
    await adapter.removeItem("key");
    expect(await adapter.getItem("key")).toBeNull();
  });

  it("notifies watchers on setItem", async () => {
    const adapter = new InMemoryStorageAdapter();
    const callback = vi.fn();
    adapter.watch("key", callback);

    await adapter.setItem("key", "new-value");
    expect(callback).toHaveBeenCalledWith("new-value");
  });

  it("notifies watchers with null on removeItem", async () => {
    const adapter = new InMemoryStorageAdapter();
    const callback = vi.fn();
    adapter.watch("key", callback);

    await adapter.setItem("key", "value");
    await adapter.removeItem("key");
    expect(callback).toHaveBeenLastCalledWith(null);
  });

  it("stops notifying after unwatch", async () => {
    const adapter = new InMemoryStorageAdapter();
    const callback = vi.fn();
    const unwatch = adapter.watch("key", callback);

    await adapter.setItem("key", "value1");
    expect(callback).toHaveBeenCalledTimes(1);

    unwatch();
    await adapter.setItem("key", "value2");
    expect(callback).toHaveBeenCalledTimes(1); // No additional call
  });
});

// ========================================
// StorageManager Tests
// ========================================

describe("StorageManager", () => {
  function createManager() {
    return new StorageManager(new InMemoryStorageAdapter());
  }

  describe("ScheduleStore", () => {
    it("returns default store when empty", async () => {
      const manager = createManager();
      const store = await manager.getScheduleStore();
      expect(store.schemaVersion).toBe(1);
      expect(store.courses).toEqual({});
      expect(store.schedules).toEqual({});
    });

    it("persists and retrieves schedule store", async () => {
      const manager = createManager();
      const store = {
        schemaVersion: 1,
        courses: {},
        schedules: {},
        instructors: ["田中"],
      };
      await manager.saveScheduleStore(store);
      const retrieved = await manager.getScheduleStore();
      expect(retrieved).toEqual(store);
    });
  });

  describe("Instructors", () => {
    it("adds and deduplicates instructors", async () => {
      const manager = createManager();
      await manager.addInstructors(["山田", "佐藤"]);
      await manager.addInstructors(["山田", "田中"]);
      const instructors = await manager.getInstructors();
      expect(instructors).toEqual(["佐藤", "山田", "田中"]); // sorted
    });
  });

  describe("Settings", () => {
    it("returns defaults for keyboard shortcuts", async () => {
      const manager = createManager();
      const settings = await manager.getKeyboardShortcuts();
      expect(settings).toEqual({
        submitShortcut: false,
        numberKeyShortcut: false,
        arrowKeyShortcut: false,
      });
    });

    it("persists keyboard shortcuts", async () => {
      const manager = createManager();
      await manager.setKeyboardShortcuts({
        submitShortcut: true,
        numberKeyShortcut: true,
        arrowKeyShortcut: false,
      });
      const settings = await manager.getKeyboardShortcuts();
      expect(settings.submitShortcut).toBe(true);
    });

    it("returns defaults for notification settings", async () => {
      const manager = createManager();
      const settings = await manager.getNotificationSettings();
      expect(settings).toEqual({ enabled: false, timings: [-10] });
    });

    it("returns default theme", async () => {
      const manager = createManager();
      expect(await manager.getTheme()).toBe("light");
    });
  });

  describe("Active Schedule ID", () => {
    it("returns null when not set", async () => {
      const manager = createManager();
      expect(await manager.getActiveScheduleId()).toBeNull();
    });

    it("sets and gets active schedule ID", async () => {
      const manager = createManager();
      await manager.setActiveScheduleId("schedule-123");
      expect(await manager.getActiveScheduleId()).toBe("schedule-123");
    });

    it("clears active schedule ID with null", async () => {
      const manager = createManager();
      await manager.setActiveScheduleId("schedule-123");
      await manager.setActiveScheduleId(null);
      expect(await manager.getActiveScheduleId()).toBeNull();
    });
  });

  describe("Watch", () => {
    it("watches theme changes", async () => {
      const manager = createManager();
      const callback = vi.fn();
      manager.watchTheme(callback);

      await manager.setTheme("dark");
      expect(callback).toHaveBeenCalledWith("dark");
    });

    it("watches schedule store changes", async () => {
      const manager = createManager();
      const callback = vi.fn();
      manager.watchScheduleStore(callback);

      const store = {
        schemaVersion: 1,
        courses: {},
        schedules: {},
      };
      await manager.saveScheduleStore(store);
      expect(callback).toHaveBeenCalledWith(store);
    });
  });
});
