import { useState, type CSSProperties } from "react";
import { Bell, Plus, Trash2 } from "lucide-react";
import type { NotificationSettings as NotificationSettingsType } from "../../types";

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onSettingsChange: (settings: NotificationSettingsType) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    marginBottom: "2rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1f2937",
    margin: 0,
  },
  description: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "1rem",
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "1.5rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  switch: {
    position: "relative",
    width: "44px",
    height: "24px",
    backgroundColor: "#d1d5db",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    border: "none",
    padding: 0,
  },
  switchActive: {
    backgroundColor: "#3b82f6",
  },
  switchThumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "20px",
    height: "20px",
    backgroundColor: "white",
    borderRadius: "50%",
    transition: "transform 0.2s",
  },
  switchThumbActive: {
    transform: "translateX(20px)",
  },
  timingsSection: {
    marginTop: "1rem",
  },
  timingsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "0.75rem",
  },
  timingItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "0.375rem",
  },
  timingText: {
    flex: 1,
    fontSize: "0.875rem",
    color: "#374151",
  },
  deleteButton: {
    padding: "0.25rem",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#ef4444",
    borderRadius: "0.25rem",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  addSection: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  input: {
    padding: "0.5rem",
    fontSize: "0.875rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    width: "100px",
  },
  addButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    transition: "background-color 0.2s",
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
      alert("正の数値を入力してください");
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
    <div style={styles.container}>
      <div style={styles.header}>
        <Bell size={20} aria-hidden="true" />
        <h3 style={styles.title}>授業前通知</h3>
      </div>

      <p style={styles.description}>
        次の授業の指定時刻前に通知を送信します
      </p>

      <div style={styles.toggleContainer}>
        <span style={styles.label}>通知を有効にする</span>
        <button
          type="button"
          style={{
            ...styles.switch,
            ...(settings.enabled ? styles.switchActive : {}),
          }}
          onClick={handleToggle}
          aria-label={settings.enabled ? "通知を無効にする" : "通知を有効にする"}
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
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
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
              style={styles.input}
              placeholder="分"
              aria-label="通知タイミング(分)"
            />
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>分前</span>
            <button
              type="button"
              style={styles.addButton}
              onClick={handleAddTiming}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#3b82f6";
              }}
            >
              <Plus size={16} />
              追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
