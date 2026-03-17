import { checkAndNotify } from "@mikoto-moocs-sharp/shared/utils/notification";
import { storageManager } from "./utils/storage";

export default defineBackground(() => {
  const sentNotifications = new Set<string>();

  const runCheck = () => {
    checkAndNotify(
      storageManager,
      sentNotifications,
      async (title, message) => {
        await browser.notifications.create({
          type: "basic",
          iconUrl: "/icon/128.png",
          title,
          message,
        });
      },
    ).catch((error) => {
      console.error("[Mikoto Background] Notification check failed:", error);
    });
  };

  // アラームリスナーを設定
  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "mikoto-notification-check") {
      runCheck();
    } else if (alarm.name === "mikoto-clear-sent-notifications") {
      sentNotifications.clear();
    }
  });

  // 初回チェックとアラーム設定
  runCheck();
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
