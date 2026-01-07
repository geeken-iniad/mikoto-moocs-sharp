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
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../styles/commonStyles";

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
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.bgLight,
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.borderLight}`,
  },
  header: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: "12px",
    color: colors.textMedium,
  },
  selectGroup: {
    display: "flex",
    gap: spacing.sm,
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  select: {
    padding: "10px",
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    fontSize: fontSize.base,
    backgroundColor: colors.bgWhite,
    minWidth: "150px",
    cursor: "pointer",
  },
  button: {
    padding: "10px 20px",
    borderRadius: borderRadius.xl,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor: "pointer",
    border: "none",
    backgroundColor: colors.primary,
    color: colors.bgWhite,
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  createSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTop: `1px solid ${colors.borderLight}`,
  },
  createLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    color: colors.textMedium,
  },
  inputGroup: {
    display: "flex",
    gap: spacing.sm,
    alignItems: "flex-end",
    flexWrap: "wrap" as const,
  },
  inputWrapper: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  input: {
    padding: "10px",
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    fontSize: fontSize.base,
    width: "100px",
    backgroundColor: colors.bgWhite,
  },
  scheduleList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
  },
  scheduleItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    backgroundColor: colors.bgWhite,
    border: `1px solid ${colors.borderDark}`,
    borderRadius: borderRadius.xl,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  scheduleItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.bgBlueLight,
  },
  scheduleItemContent: {
    flex: 1,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textMedium,
  },
  starButton: {
    padding: spacing.xs,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    borderRadius: borderRadius.sm,
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
    color: colors.borderDark,
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
    if (
      Number.isNaN(year) ||
      year < MIN_ACADEMIC_YEAR ||
      year > MAX_ACADEMIC_YEAR
    ) {
      alert(
        `有効な年度を入力してください（${MIN_ACADEMIC_YEAR}-${MAX_ACADEMIC_YEAR}）`,
      );
      return;
    }

    try {
      const termInfo = createTermInfo(newSemester, newDivision);
      const schedule = createSchedule(year, termInfo);
      onCreateSchedule(schedule);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "時間割の作成に失敗しました",
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
                    <span
                      style={{
                        marginLeft: spacing.sm,
                        fontSize: fontSize.sm,
                        color: colors.textLight,
                      }}
                    >
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
          <div style={{ fontSize: fontSize.base, color: colors.textLight }}>
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
                  value === "Semester"
                    ? "Semester"
                    : (Number.parseInt(value) as TermDivision),
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
          <button
            type="button"
            style={styles.button}
            onClick={handleCreateSchedule}
          >
            <CalendarPlus size={16} aria-hidden="true" />
            作成
          </button>
        </div>
      </div>
    </div>
  );
};
