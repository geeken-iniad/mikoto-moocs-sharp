import { useState, type CSSProperties } from "react";
import type { Schedule, ScheduleStore, Semester, TermDivision } from "../../types";
import { SEMESTER_LABELS, VALID_TERM_DIVISIONS } from "../../constants";
import { createTermInfo, formatTermInfo, createSchedule } from "../../utils/schedule";

interface ScheduleSelectorProps {
  store: ScheduleStore;
  selectedSchedule: Schedule | null;
  onSelectSchedule: (schedule: Schedule) => void;
  onCreateSchedule: (schedule: Schedule) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
  },
  header: {
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: "#374151",
  },
  selectGroup: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  select: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    backgroundColor: "#ffffff",
    minWidth: "150px",
  },
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  createSection: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #e5e7eb",
  },
  createLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
    marginBottom: "0.5rem",
    color: "#374151",
  },
  inputGroup: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "flex-end",
    flexWrap: "wrap" as const,
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.75rem",
    color: "#6b7280",
  },
  input: {
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    width: "100px",
  },
};

export const ScheduleSelector = ({
  store,
  selectedSchedule,
  onSelectSchedule,
  onCreateSchedule,
}: ScheduleSelectorProps) => {
  const schedules = Object.values(store.schedules);

  // Create new schedule form state
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newSemester, setNewSemester] = useState<Semester>("Spring");
  const [newDivision, setNewDivision] = useState<TermDivision>("Semester");

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = store.schedules[scheduleId];
    if (schedule) {
      onSelectSchedule(schedule);
    }
  };

  const handleCreateSchedule = () => {
    const year = Number.parseInt(newYear, 10);
    if (Number.isNaN(year) || year < 2000 || year > 2100) {
      alert("有効な年度を入力してください（2000-2100）");
      return;
    }

    try {
      const termInfo = createTermInfo(newSemester, newDivision);
      const schedule = createSchedule(year, termInfo);
      onCreateSchedule(schedule);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "時間割の作成に失敗しました",
      );
    }
  };

  const validDivisions = VALID_TERM_DIVISIONS[newSemester];

  return (
    <div style={styles.container}>
      <div style={styles.header}>時間割を選択</div>
      <div style={styles.selectGroup}>
        {schedules.length > 0 ? (
          <select
            style={styles.select}
            value={selectedSchedule?.id || ""}
            onChange={(e) => handleScheduleChange(e.target.value)}
          >
            <option value="">選択してください</option>
            {schedules.map((schedule) => (
              <option key={schedule.id} value={schedule.id}>
                {formatTermInfo(schedule.academicYear, schedule.term)}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            時間割がありません。新規作成してください。
          </div>
        )}
      </div>

      <div style={styles.createSection}>
        <div style={styles.createLabel}>新しい時間割を作成</div>
        <div style={styles.inputGroup}>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>年度</label>
            <input
              type="number"
              style={styles.input}
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              min="2000"
              max="2100"
              placeholder="2024"
            />
          </div>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>学期</label>
            <select
              style={styles.select}
              value={newSemester}
              onChange={(e) => {
                const semester = e.target.value as Semester;
                setNewSemester(semester);
                // Reset division to valid one for new semester
                setNewDivision("Semester");
              }}
            >
              {Object.entries(SEMESTER_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.inputWrapper}>
            <label style={styles.label}>区分</label>
            <select
              style={styles.select}
              value={newDivision}
              onChange={(e) => {
                const value = e.target.value;
                setNewDivision(
                  value === "Semester" ? "Semester" : (Number.parseInt(value) as TermDivision),
                );
              }}
            >
              {validDivisions.map((div) => (
                <option key={div} value={div}>
                  {div === "Semester" ? "学期通し" : `${div}Q`}
                </option>
              ))}
            </select>
          </div>
          <button type="button" style={styles.button} onClick={handleCreateSchedule}>
            作成
          </button>
        </div>
      </div>
    </div>
  );
};
