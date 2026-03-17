import { describe, expect, it } from "vitest";
import type {
  IStorageAdapter,
  StorageUnwatchFunction,
  StorageWatchCallback,
} from "../interface";
import { STORAGE_KEYS } from "../manager";
import { runMigrations } from "../migrations";

class InMemoryStorageAdapter implements IStorageAdapter {
  private store = new Map<string, unknown>();

  async getItem<T>(key: string): Promise<T | null> {
    const value = this.store.get(key);
    return (value as T) ?? null;
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  watch<T>(
    _key: string,
    _callback: StorageWatchCallback<T>,
  ): StorageUnwatchFunction {
    return () => {};
  }
}

describe("runMigrations", () => {
  it("runs on fresh install (no data)", async () => {
    const adapter = new InMemoryStorageAdapter();
    const result = await runMigrations(adapter);

    expect(result.fromVersion).toBe(0);
    expect(result.toVersion).toBe(1);
    expect(result.applied).toEqual([1]);
    expect(result.errors).toEqual([]);
  });

  it("skips already-applied migrations", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem("mikoto-migration-version", 1);

    const result = await runMigrations(adapter);
    expect(result.applied).toEqual([]);
  });

  it("migration v1: repairs old schedule format with array grid", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem(STORAGE_KEYS.SCHEDULE_STORE, {
      schemaVersion: 1,
      courses: {},
      schedules: {
        "s-1": {
          id: "s-1",
          academicYear: 2025,
          term: { semester: "Spring", division: "Semester" },
          grid: [], // old format: array instead of object
          slots: {},
          exceptions: {},
        },
      },
    });

    const result = await runMigrations(adapter);
    expect(result.applied).toContain(1);

    const store = await adapter.getItem<Record<string, unknown>>(
      STORAGE_KEYS.SCHEDULE_STORE,
    );
    const schedule = (
      store?.schedules as Record<string, Record<string, unknown>>
    )?.["s-1"];
    expect(schedule?.grid).toEqual({});
    expect(schedule?.slots).toEqual({});
  });

  it("migration v1: preserves valid schedule data", async () => {
    const adapter = new InMemoryStorageAdapter();
    const validStore = {
      schemaVersion: 1,
      courses: { "c-1": { id: "c-1", name: "テスト", instructors: [] } },
      schedules: {
        "s-1": {
          id: "s-1",
          academicYear: 2025,
          term: { semester: "Spring", division: "Semester" },
          grid: { "Mon-1": "slot-1" },
          slots: { "slot-1": { id: "slot-1", courseId: "c-1" } },
          exceptions: {},
        },
      },
    };
    await adapter.setItem(STORAGE_KEYS.SCHEDULE_STORE, validStore);

    await runMigrations(adapter);

    const store = await adapter.getItem<Record<string, unknown>>(
      STORAGE_KEYS.SCHEDULE_STORE,
    );
    const schedule = (
      store?.schedules as Record<string, Record<string, unknown>>
    )?.["s-1"];
    expect(schedule?.grid).toEqual({ "Mon-1": "slot-1" });
  });

  it("migration v1: repairs null grid/slots/exceptions", async () => {
    const adapter = new InMemoryStorageAdapter();
    await adapter.setItem(STORAGE_KEYS.SCHEDULE_STORE, {
      schemaVersion: 1,
      courses: {},
      schedules: {
        "s-1": {
          id: "s-1",
          academicYear: 2025,
          term: { semester: "Spring", division: "Semester" },
          grid: null,
          slots: null,
          exceptions: null,
        },
      },
    });

    await runMigrations(adapter);

    const store = await adapter.getItem<Record<string, unknown>>(
      STORAGE_KEYS.SCHEDULE_STORE,
    );
    const schedule = (
      store?.schedules as Record<string, Record<string, unknown>>
    )?.["s-1"];
    expect(schedule?.grid).toEqual({});
    expect(schedule?.slots).toEqual({});
    expect(schedule?.exceptions).toEqual({});
  });
});
