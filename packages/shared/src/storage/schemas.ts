/**
 * Valibot schemas for runtime validation of all stored data types.
 * Used at IO boundaries (storage read/write) to ensure data integrity.
 */
import * as v from "valibot";

// ========================================
// Primitive Schemas
// ========================================

const TimeSlotKeySchema = v.pipe(
  v.string(),
  v.regex(/^(Mon|Tue|Wed|Thu|Fri|Sat)-[1-7]$/),
);

const CampusIdSchema = v.picklist([
  "akabanedai",
  "asaka",
  "kawagoe",
  "hakusan",
]);

const DeliveryModeSchema = v.picklist([
  "face-to-face",
  "online",
  "on-demand",
  "online-on-demand",
]);

const RoomTypeSchema = v.picklist(["physical", "online", "on-demand"]);

const ExceptionTypeSchema = v.picklist([
  "delivery-mode-change",
  "cancellation",
  "makeup",
  "room-change",
  "other",
]);

const SemesterSchema = v.picklist(["Spring", "Fall"]);

const TermDivisionSchema = v.union([
  v.literal("Semester"),
  v.picklist([1, 2, 3, 4]),
]);

// ========================================
// Composite Schemas
// ========================================

const RoomSchema = v.object({
  type: RoomTypeSchema,
  campus: v.optional(CampusIdSchema),
  building: v.optional(v.string()),
  number: v.string(),
  note: v.optional(v.string()),
});

const CourseUrlsSchema = v.object({
  moocs: v.optional(v.string()),
  classroom: v.optional(v.string()),
  toyonetAce: v.optional(v.string()),
  slack: v.optional(v.string()),
  syllabus: v.optional(v.string()),
  other: v.optional(v.array(v.object({ label: v.string(), url: v.string() }))),
});

const CourseSchema = v.object({
  id: v.string(),
  code: v.optional(v.string()),
  name: v.string(),
  instructors: v.array(v.string()),
  urls: v.optional(CourseUrlsSchema),
  defaultRooms: v.optional(v.array(RoomSchema)),
});

const ScheduleSlotSchema = v.object({
  id: v.string(),
  courseId: v.string(),
  rooms: v.optional(v.array(RoomSchema)),
  defaultDeliveryMode: v.optional(DeliveryModeSchema),
  memo: v.optional(v.string()),
  color: v.optional(v.string()),
  customInstructors: v.optional(v.array(v.string())),
});

const MakeupInfoSchema = v.object({
  originalDate: v.string(),
  makeupDate: v.string(),
  makeupTimeSlotKey: v.optional(TimeSlotKeySchema),
  makeupRooms: v.optional(v.array(RoomSchema)),
});

const ExceptionEntrySchema = v.object({
  id: v.string(),
  slotId: v.string(),
  date: v.string(),
  type: ExceptionTypeSchema,
  changedDeliveryMode: v.optional(DeliveryModeSchema),
  changedRooms: v.optional(v.array(RoomSchema)),
  makeupInfo: v.optional(MakeupInfoSchema),
  memo: v.optional(v.string()),
});

const TermInfoSchema = v.object({
  semester: SemesterSchema,
  division: TermDivisionSchema,
});

const ScheduleSchema = v.object({
  id: v.string(),
  academicYear: v.number(),
  term: TermInfoSchema,
  grid: v.record(v.string(), v.string()),
  slots: v.record(v.string(), ScheduleSlotSchema),
  exceptions: v.record(v.string(), v.array(ExceptionEntrySchema)),
});

// ========================================
// Storage Root Schemas
// ========================================

export const ScheduleStoreSchema = v.object({
  schemaVersion: v.number(),
  courses: v.record(v.string(), CourseSchema),
  schedules: v.record(v.string(), ScheduleSchema),
  instructors: v.optional(v.array(v.string())),
});

export const KeyboardShortcutSettingsSchema = v.object({
  submitShortcut: v.boolean(),
  numberKeyShortcut: v.boolean(),
  arrowKeyShortcut: v.boolean(),
});

export const CampusSettingsSchema = v.object({
  defaultCampus: v.optional(CampusIdSchema),
});

export const NotificationSettingsSchema = v.object({
  enabled: v.boolean(),
  timings: v.array(v.number()),
});

export const ThemeSchema = v.picklist(["light", "dark"]);

// ========================================
// Parse helpers
// ========================================

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Safely parse data against a schema.
 * Returns typed result without throwing.
 */
export function safeParse<T>(
  schema: v.GenericSchema<T>,
  data: unknown,
): ParseResult<T> {
  const result = v.safeParse(schema, data);
  if (result.success) {
    return { success: true, data: result.output };
  }
  const messages = result.issues.map((i) => i.message).join("; ");
  return { success: false, error: messages };
}
