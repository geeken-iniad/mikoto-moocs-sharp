import { PERIODS } from "../constants";
import type {
  Course,
  Period,
  Schedule,
  ScheduleSlot,
  ScheduleStore,
  TimeSlotKey,
  Weekday,
} from "../types";
import { parseTimeSlotKey } from "./schedule";

/**
 * 次の授業情報
 */
export interface NextClass {
  schedule: Schedule;
  slot: ScheduleSlot;
  course: Course;
  timeSlotKey: TimeSlotKey;
  startTime: Date;
  weekday: Weekday;
  period: Period;
}

/**
 * 現在時刻から次の授業を取得
 * @param store スケジュールストア
 * @param scheduleId 対象のスケジュールID
 * @param now 現在時刻(省略時は現在時刻)
 */
export function getNextClass(
  store: ScheduleStore,
  scheduleId: string,
  now: Date = new Date(),
): NextClass | null {
  const currentTime = now.getTime();
  const currentDay = now.getDay(); // 0:日曜, 1:月曜, ..., 6:土曜

  // 日曜日は授業がないのでnull
  if (currentDay === 0) return null;

  const weekdayMap: Record<number, Weekday> = {
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };

  let closestClass: NextClass | null = null;
  let closestTimeDiff = Number.POSITIVE_INFINITY;

  // 指定されたスケジュールを取得
  const schedule = store.schedules[scheduleId];
  if (!schedule) {
    return null;
  }

  // グリッド内の全授業をチェック
  for (const [timeSlotKey, slotId] of Object.entries(schedule.grid)) {
    const parsed = parseTimeSlotKey(timeSlotKey as TimeSlotKey);
    if (!parsed) continue;

    const { weekday, period } = parsed;
    const slot = schedule.slots[slotId];
    if (!slot) continue;

    const course = store.courses[slot.courseId];
    if (!course) continue;

    // 授業の開始時刻を取得
    const periodInfo = PERIODS[period];
    const [startHour, startMinute] = periodInfo.start.split(":").map(Number);

    // 今週のその曜日・時限の授業の開始時刻を計算
    const classDate = new Date(now);
    const weekdayIndex = Object.keys(weekdayMap).find(
      (key) => weekdayMap[Number(key)] === weekday,
    );
    if (!weekdayIndex) continue;

    const targetDay = Number(weekdayIndex);
    let dayDiff = targetDay - currentDay;

    // 過去の曜日または同じ曜日で授業開始時刻が過ぎている場合は来週
    if (dayDiff < 0) {
      dayDiff += 7;
    } else if (dayDiff === 0) {
      // 同じ曜日の場合、時刻をチェック
      const tempDate = new Date(now);
      tempDate.setHours(startHour, startMinute, 0, 0);
      if (tempDate.getTime() <= currentTime) {
        // 授業開始時刻が過ぎていたら来週
        dayDiff = 7;
      }
    }

    classDate.setDate(classDate.getDate() + dayDiff);
    classDate.setHours(startHour, startMinute, 0, 0);

    const classTime = classDate.getTime();
    const timeDiff = classTime - currentTime;

    // 未来の授業のみを対象とし、最も近いものを保持
    if (timeDiff > 0 && timeDiff < closestTimeDiff) {
      closestTimeDiff = timeDiff;
      closestClass = {
        schedule,
        slot,
        course,
        timeSlotKey: timeSlotKey as TimeSlotKey,
        startTime: classDate,
        weekday,
        period,
      };
    }
  }

  return closestClass;
}

/**
 * 通知すべきタイミングかどうかをチェック
 * @param nextClass 次の授業
 * @param timings 通知タイミング(分単位、負の数)
 * @param now 現在時刻
 * @param sentNotifications 既に送信済みの通知キー
 * @returns 通知すべき場合はタイミング値、そうでなければnull
 */
export function shouldNotify(
  nextClass: NextClass,
  timings: number[],
  now: Date = new Date(),
  sentNotifications: Set<string> = new Set(),
): number | null {
  const currentTime = now.getTime();
  const classTime = nextClass.startTime.getTime();

  for (const timing of timings) {
    // timingは負の数なので、絶対値を取って分をミリ秒に変換
    const notifyTime = classTime + timing * 60 * 1000;
    const timeDiff = Math.abs(currentTime - notifyTime);

    // 現在時刻が通知時刻の前後30秒以内にあるかチェック
    // (1分ごとのチェックを想定しているため、30秒の猶予を持たせる)
    if (timeDiff <= 30 * 1000) {
      // 既に送信済みかチェック
      const notificationKey = `${nextClass.schedule.id}-${nextClass.timeSlotKey}-${timing}`;
      if (!sentNotifications.has(notificationKey)) {
        sentNotifications.add(notificationKey);
        return timing;
      }
    }
  }

  return null;
}

/**
 * 通知メッセージを生成
 */
export function createNotificationMessage(
  nextClass: NextClass,
  minutesBefore: number,
): { title: string; body: string } {
  const absMinutes = Math.abs(minutesBefore);
  const periodInfo = PERIODS[nextClass.period];

  // 教員名を取得(カスタム教員 or デフォルト教員)
  const instructors =
    nextClass.slot.customInstructors ?? nextClass.course.instructors;
  const instructorNames = instructors.length > 0 ? instructors.join(", ") : "";

  return {
    title: `${absMinutes}分後に授業があります`,
    body: `${nextClass.course.name}(${instructorNames})\n${periodInfo.label}(${periodInfo.start}〜${periodInfo.end})`,
  };
}

/**
 * 通知チェックに必要なストレージ読み取りインターフェース
 */
export interface NotificationStorageReader {
  getNotificationSettings(): Promise<{ enabled: boolean; timings: number[] }>;
  getScheduleStore(): Promise<ScheduleStore>;
  getActiveScheduleId(): Promise<string | null>;
}

/**
 * プラットフォーム固有の通知送信関数
 */
export type NotificationSender = (title: string, body: string) => void;

/**
 * 共通の通知チェック＆送信ロジック
 * userscript と extension の両方で同一ロジックを使用する。
 */
export async function checkAndNotify(
  storage: NotificationStorageReader,
  sentNotifications: Set<string>,
  sendNotification: NotificationSender,
): Promise<void> {
  const notificationSettings = await storage.getNotificationSettings();
  if (!notificationSettings.enabled) {
    return;
  }

  const store = await storage.getScheduleStore();

  let activeScheduleId = await storage.getActiveScheduleId();
  if (!activeScheduleId) {
    const scheduleIds = Object.keys(store.schedules);
    if (scheduleIds.length === 0) {
      return;
    }
    activeScheduleId = scheduleIds[0];
  }

  const nextClass = getNextClass(store, activeScheduleId);
  if (!nextClass) {
    return;
  }

  const timing = shouldNotify(
    nextClass,
    notificationSettings.timings,
    new Date(),
    sentNotifications,
  );

  if (timing !== null) {
    const { title, body } = createNotificationMessage(nextClass, timing);
    sendNotification(title, body);
  }
}
