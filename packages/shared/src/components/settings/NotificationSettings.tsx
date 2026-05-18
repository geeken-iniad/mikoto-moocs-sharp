import { Bell, Plus, Trash2 } from "lucide-react";
import { type CSSProperties, useState } from "react";
import type { NotificationSettings as NotificationSettingsType } from "../../settings/types";
import {
  borderRadius,
  buttonPrimary,
  colors,
  description,
  fontSize,
  fontWeight,
  section,
  spacing,
} from "../../styles/commonStyles";

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onSettingsChange: (settings: NotificationSettingsType) => void;
}

const styles: Record<string, CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    margin: 0,
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textMedium,
  },
  switch: {
    position: "relative",
    width: "44px",
    height: "24px",
    backgroundColor: colors.borderDark,
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    border: "none",
    padding: 0,
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchThumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "20px",
    height: "20px",
    backgroundColor: colors.bgWhite,
    borderRadius: "50%",
    transition: "transform 0.2s",
  },
  switchThumbActive: {
    transform: "translateX(20px)",
  },
  timingsSection: {
    marginTop: spacing.md,
  },
  timingsList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timingItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.bgGray,
    borderRadius: borderRadius.xl,
  },
  timingText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.textMedium,
  },
  deleteButton: {
    padding: spacing.xs,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: colors.danger,
    borderRadius: borderRadius.md,
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  addSection: {
    display: "flex",
    gap: spacing.sm,
    alignItems: "center",
  },
  inputNumber: {
    padding: "10px",
    fontSize: fontSize.base,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    width: "100px",
    backgroundColor: colors.bgWhite,
  },
};

export const NotificationSettings = ({
  settings,
  onSettingsChange,
}: NotificationSettingsProps) => {
  const [newTiming, setNewTiming] = useState<string>("10");

  const handleToggle = () => {
    onSettingsChange({ ...settings, enabled: !settings.enabled });
  };

  const handleAddTiming = () => {
    const minutes = Number.parseInt(newTiming, 10);
    if (Number.isNaN(minutes) || minutes <= 0) {
      alert("正の整数を入力してください");
      return;
    }

    // 負の数に変換(「X分前」を表現)
    const timing = -minutes;

    // 重複チェック
    if (settings.timings.includes(timing)) {
      alert("既に同じタイミングが設定されています");
      return;
    }

    onSettingsChange({
      ...settings,
      timings: [...settings.timings, timing].sort((a, b) => a - b),
    });
    setNewTiming("10");
  };

  const handleDeleteTiming = (timing: number) => {
    onSettingsChange({
      ...settings,
      timings: settings.timings.filter((t) => t !== timing),
    });
  };

  return (
    <div style={section}>
      <div style={styles.header}>
        <Bell size={20} aria-hidden="true" />
        <h3 style={styles.title}>授業前通知</h3>
      </div>

      <p style={description}>次の授業の指定時刻前に通知を送信します</p>

      <div style={styles.toggleContainer}>
        <span style={styles.label}>通知を有効にする</span>
        <button
          type="button"
          style={{
            ...styles.switch,
            ...(settings.enabled ? styles.switchActive : {}),
          }}
          onClick={handleToggle}
          aria-label={
            settings.enabled ? "通知を無効にする" : "通知を有効にする"
          }
        >
          <div
            style={{
              ...styles.switchThumb,
              ...(settings.enabled ? styles.switchThumbActive : {}),
            }}
          />
        </button>
      </div>

      {settings.enabled && (
        <div style={styles.timingsSection}>
          <span style={styles.label}>通知タイミング</span>

          <div style={styles.timingsList}>
            {settings.timings.length === 0 ? (
              <p style={{ fontSize: fontSize.base, color: colors.textLight }}>
                通知タイミングが設定されていません
              </p>
            ) : (
              settings.timings.map((timing) => (
                <div key={timing} style={styles.timingItem}>
                  <span style={styles.timingText}>
                    授業の{Math.abs(timing)}分前
                  </span>
                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => handleDeleteTiming(timing)}
                    aria-label={`${Math.abs(timing)}分前の通知を削除`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={styles.addSection}>
            <input
              type="number"
              min="1"
              step="1"
              value={newTiming}
              onChange={(e) => setNewTiming(e.target.value)}
              style={styles.inputNumber}
              placeholder="分"
              aria-label="通知タイミング(分)"
            />
            <span style={{ fontSize: fontSize.base, color: colors.textLight }}>
              分前
            </span>
            <button
              type="button"
              style={buttonPrimary}
              onClick={handleAddTiming}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
              }}
            >
              <Plus size={16} aria-hidden="true" />
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
