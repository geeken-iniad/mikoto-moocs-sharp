import type { StorageManager } from "@mikoto-moocs-sharp/shared";
import { checkAndNotify } from "@mikoto-moocs-sharp/shared/utils/notification";
import { GM_notification } from "$";

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
    this.runCheck();

    // 1分ごとにチェック
    this.intervalId = window.setInterval(() => {
      this.runCheck();
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

  private runCheck() {
    checkAndNotify(this.storageManager, this.sentNotifications, (title, text) =>
      GM_notification({ title, text, silent: false }),
    ).catch((error) => {
      console.error("[Mikoto NotificationManager] Check failed:", error);
    });
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
