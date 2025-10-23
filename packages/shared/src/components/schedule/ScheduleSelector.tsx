import { useState, type CSSProperties } from "react";
import { CalendarPlus, Star } from "lucide-react";
import type { Schedule, Semester, TermDivision } from "../../types";
import { SEMESTER_LABELS, VALID_TERM_DIVISIONS } from "../../constants";
import {
  createTermInfo,
  formatTermInfo,
  createSchedule,
  MIN_ACADEMIC_YEAR,
  MAX_ACADEMIC_YEAR,
} from "../../utils/schedule";

interface ScheduleSelectorProps {
  schedules: Schedule[];
  selectedScheduleId: string | null;
  activeScheduleId: string | null;
  onSelectSchedule: (scheduleId: string) => void;
  onSetActive: (scheduleId: string) => void;
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
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
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
  scheduleList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  scheduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  scheduleItemSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  scheduleItemContent: {
    flex: 1,
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#374151",
  },
  starButton: {
    padding: "0.25rem",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    borderRadius: "0.25rem",
    transition: "background-color 0.2s",
  },
  starIcon: {
    width: "20px",
    height: "20px",
  },
  starActive: {
    fill: "#fbbf24",
    color: "#fbbf24",
  },
  starInactive: {
    fill: "none",
    color: "#d1d5db",
  },
};

export const ScheduleSelector = ({
  schedules,
  selectedScheduleId,
  activeScheduleId,
  onSelectSchedule,
  onSetActive,
  onCreateSchedule,
}: ScheduleSelectorProps) => {

  // Create new schedule form state
  // The default year is initialized to the current year only once when the component mounts.
  // If the component remains mounted across a year boundary, this value will not update automatically.
  // This is intentional; users can manually change the year if needed.
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newSemester, setNewSemester] = useState<Semester>("Spring");
  const [newDivision, setNewDivision] = useState<TermDivision>("Semester");

  const handleCreateSchedule = () => {
    const year = Number.parseInt(newYear, 10);
    if (Number.isNaN(year) || year < MIN_ACADEMIC_YEAR || year > MAX_ACADEMIC_YEAR) {
      alert(`有効な年度を入力してください（${MIN_ACADEMIC_YEAR}-${MAX_ACADEMIC_YEAR}）`);
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
      <div style={styles.scheduleList}>
        {schedules.length > 0 ? (
          schedules.map((schedule) => {
            const isSelected = schedule.id === selectedScheduleId;
            const isActive = schedule.id === activeScheduleId;
            return (
              <div
                key={schedule.id}
                style={{
                  ...styles.scheduleItem,
                  ...(isSelected ? styles.scheduleItemSelected : {}),
                }}
                onClick={() => onSelectSchedule(schedule.id)}
              >
                <div style={styles.scheduleItemContent}>
                  {formatTermInfo(schedule.academicYear, schedule.term)}
                  {isActive && (
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
                      (通知対象)
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  style={styles.starButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActive(schedule.id);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                  aria-label={isActive ? "通知対象から外す" : "通知対象に設定"}
                  title={isActive ? "通知対象から外す" : "通知対象に設定"}
                >
                  <Star
                    style={{
                      ...styles.starIcon,
                      ...(isActive ? styles.starActive : styles.starInactive),
                    }}
                  />
                </button>
              </div>
            );
          })
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
              min={MIN_ACADEMIC_YEAR}
              max={MAX_ACADEMIC_YEAR}
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
            <CalendarPlus size={16} aria-hidden="true" />
            作成
          </button>
        </div>
      </div>
    </div>
  );
};
