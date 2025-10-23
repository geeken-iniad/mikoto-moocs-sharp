import { GM_notification } from "$";
import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import { getNextClass, shouldNotify, createNotificationMessage } from "@mikoto-moocs-sharp/shared/utils/notification";

/**
 * Userscript向け通知マネージャー
 */
export class NotificationManager {
  private intervalId: number | null = null;
  private sentNotifications = new Set<string>();

  constructor(private storageManager: StorageManager) {}

  /**
   * 通知チェックを開始
   */
  start() {
    if (this.intervalId !== null) {
      return;
    }

    // 初回チェック
    this.checkAndNotify();

    // 1分ごとにチェック
    this.intervalId = window.setInterval(() => {
      this.checkAndNotify();
    }, 60 * 1000);

    // 1日1回送信済み通知をクリア(午前0時にリセット)
    this.scheduleMidnightReset();
  }

  /**
   * 通知チェックを停止
   */
  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * 通知チェックと送信
   */
  private async checkAndNotify() {
    try {
      // 通知設定を取得
      const notificationSettings = await this.storageManager.getNotificationSettings();
      if (!notificationSettings.enabled) {
        return;
      }

      // スケジュールストアを取得
      const store = await this.storageManager.getScheduleStore();

      // 次の授業を取得
      const nextClass = getNextClass(store);
      if (!nextClass) {
        return;
      }

      // 通知すべきタイミングかチェック
      const timing = shouldNotify(
        nextClass,
        notificationSettings.timings,
        new Date(),
        this.sentNotifications
      );

      if (timing !== null) {
        // 通知メッセージを作成
        const { title, body } = createNotificationMessage(nextClass, timing);

        // GM_notificationで通知を送信
        GM_notification({
          title,
          text: body,
          silent: false,
        });
      }
    } catch (error) {
      console.error("[Mikoto NotificationManager] Check failed:", error);
    }
  }

  /**
   * 午前0時に送信済み通知をクリアするスケジュール設定
   */
  private scheduleMidnightReset() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    window.setTimeout(() => {
      this.sentNotifications.clear();
      // 次の午前0時のリセットをスケジュール
      this.scheduleMidnightReset();
    }, msUntilMidnight);
  }
}
