/**
 * Versioned data migration system for stored data.
 *
 * Migrations run once at app bootstrap (outside React).
 * They are idempotent and cross-key aware.
 */
import type { IStorageAdapter } from "./interface";
import { STORAGE_KEYS } from "./manager";

export interface Migration {
  /** Target schema version after this migration */
  version: number;
  /** Human-readable description */
  description: string;
  /** Migration function. Receives adapter for cross-key access. */
  migrate: (adapter: IStorageAdapter) => Promise<void>;
}

const MIGRATION_VERSION_KEY = "mikoto-migration-version";

/**
 * All migrations, ordered by version.
 * Each migration assumes the previous version's schema.
 */
export const migrations: Migration[] = [
  {
    version: 1,
    description:
      "Fix old schedule format: ensure grid/slots/exceptions are objects",
    async migrate(adapter) {
      const store = await adapter.getItem<Record<string, unknown>>(
        STORAGE_KEYS.SCHEDULE_STORE,
      );
      if (!store) return;

      const schedules = store.schedules as
        | Record<string, Record<string, unknown>>
        | undefined;
      if (!schedules || typeof schedules !== "object") return;

      let changed = false;
      for (const [id, schedule] of Object.entries(schedules)) {
        const isInvalidRecord = (value: unknown) =>
          !value ||
          typeof value !== "object" ||
          value === null ||
          Array.isArray(value);

        if (
          isInvalidRecord(schedule.grid) ||
          isInvalidRecord(schedule.slots) ||
          isInvalidRecord(schedule.exceptions)
        ) {
          // Repair instead of reset: set invalid fields to empty objects
          const isValidRecord = (val: unknown) =>
            val &&
            typeof val === "object" &&
            val !== null &&
            !Array.isArray(val);
          schedules[id] = {
            ...schedule,
            grid: isValidRecord(schedule.grid) ? schedule.grid : {},
            slots: isValidRecord(schedule.slots) ? schedule.slots : {},
            exceptions: isValidRecord(schedule.exceptions)
              ? schedule.exceptions
              : {},
          };
          changed = true;
        }
      }

      if (changed) {
        await adapter.setItem(STORAGE_KEYS.SCHEDULE_STORE, {
          ...store,
          schedules,
        });
        console.log("[Migration v1] Repaired old schedule format");
      }
    },
  },
];

export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  applied: number[];
  errors: Array<{ version: number; error: string }>;
}

/**
 * Run all pending migrations.
 * Call once at app bootstrap, before React rendering.
 */
export async function runMigrations(
  adapter: IStorageAdapter,
): Promise<MigrationResult> {
  const currentVersion =
    (await adapter.getItem<number>(MIGRATION_VERSION_KEY)) ?? 0;
  const pending = migrations.filter((m) => m.version > currentVersion);
  const latestVersion =
    migrations.length > 0 ? migrations[migrations.length - 1].version : 0;

  const result: MigrationResult = {
    fromVersion: currentVersion,
    toVersion: latestVersion,
    applied: [],
    errors: [],
  };

  for (const migration of pending) {
    try {
      await migration.migrate(adapter);
      result.applied.push(migration.version);
      await adapter.setItem(MIGRATION_VERSION_KEY, migration.version);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push({ version: migration.version, error: message });
      console.error(`[Migration v${migration.version}] Failed: ${message}`);
      // Stop on first failure - don't run later migrations
      break;
    }
  }

  return result;
}
