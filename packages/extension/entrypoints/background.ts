import {
  createNotificationMessage,
  getNextClass,
  shouldNotify,
} from "@mikoto-moocs-sharp/shared/utils/notification";
import { storageManager } from "./utils/storage";

export default defineBackground(() => {
  const sentNotifications = new Set<string>();

  // 通知チェック関数
  const checkAndNotify = async () => {
    try {
      // 通知設定を取得
      const notificationSettings =
        await storageManager.getNotificationSettings();
      if (!notificationSettings.enabled) {
        return;
      }

      // スケジュールストアを取得
      const store = await storageManager.getScheduleStore();

      // アクティブなスケジュールIDを取得
      let activeScheduleId = await storageManager.getActiveScheduleId();

      // アクティブなスケジュールが設定されていない場合、最初のスケジュールを使用
      if (!activeScheduleId) {
        const scheduleIds = Object.keys(store.schedules);
        if (scheduleIds.length === 0) {
          return; // スケジュールが1つもない
        }
        activeScheduleId = scheduleIds[0];
      }

      // 次の授業を取得
      const nextClass = getNextClass(store, activeScheduleId);
      if (!nextClass) {
        return;
      }

      // 通知すべきタイミングかチェック
      const timing = shouldNotify(
        nextClass,
        notificationSettings.timings,
        new Date(),
        sentNotifications,
      );

      if (timing !== null) {
        // 通知メッセージを作成
        const { title, body } = createNotificationMessage(nextClass, timing);

        // ブラウザ通知を送信
        await browser.notifications.create({
          type: "basic",
          iconUrl: "/icon/128.png",
          title,
          message: body,
        });
      }
    } catch (error) {
      console.error("[Mikoto Background] Notification check failed:", error);
    }
  };

  // アラームリスナーを設定
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "mikoto-notification-check") {
      checkAndNotify();
    } else if (alarm.name === "mikoto-clear-sent-notifications") {
      sentNotifications.clear();
    }
  });

  // 初回チェックとアラーム設定
  checkAndNotify();
  browser.alarms.create("mikoto-notification-check", {
    periodInMinutes: 1,
  });

  // 1日1回送信済み通知をクリア(午前0時にリセット)
  browser.alarms.create("mikoto-clear-sent-notifications", {
    when: Date.now() + getMillisecondsUntilMidnight(),
    periodInMinutes: 24 * 60,
  });
});

/**
 * 次の午前0時までのミリ秒数を取得
 */
function getMillisecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}
