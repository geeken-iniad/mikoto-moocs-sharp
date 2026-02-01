import type { CSSProperties } from "react";
import { DAY_LABELS, DAYS, PERIODS } from "../../constants";
import type { Period, Schedule, ScheduleStore, Weekday } from "../../types";
import { createTimeSlotKey, getSlotByTimeSlot } from "../../utils/schedule";
import { ScheduleCell } from "./ScheduleCell";
import {
  colors,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../styles/commonStyles";

interface ScheduleGridProps {
  store: ScheduleStore;
  schedule: Schedule;
  onCellClick: (weekday: Weekday, period: Period) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    overflowX: "auto",
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.borderLight}`,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  headerCell: {
    padding: "16px",
    backgroundColor: colors.bgLight,
    borderBottom: `2px solid ${colors.borderLight}`,
    fontWeight: fontWeight.semibold,
    textAlign: "center",
    color: colors.textMedium,
    fontSize: fontSize.lg,
  },
  periodHeader: {
    width: "120px",
  },
  dayHeader: {
    minWidth: "200px",
  },
  periodCell: {
    padding: "16px",
    backgroundColor: colors.bgLight,
    borderRight: `1px solid ${colors.borderLight}`,
    fontWeight: fontWeight.medium,
    textAlign: "center",
    color: colors.textLight,
    fontSize: fontSize.base,
  },
  periodTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: "6px",
  },
};

export const ScheduleGrid = ({
  store,
  schedule,
  onCellClick,
}: ScheduleGridProps) => {
  const periods: Period[] = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.headerCell, ...styles.periodHeader }}>
              時限
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                style={{ ...styles.headerCell, ...styles.dayHeader }}
              >
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period}>
              <td style={styles.periodCell}>
                <div>{PERIODS[period].label}</div>
                <div style={styles.periodTime}>
                  {PERIODS[period].start}-{PERIODS[period].end}
                </div>
              </td>
              {DAYS.map((day) => {
                const timeSlotKey = createTimeSlotKey(day, period);
                const slot = getSlotByTimeSlot(schedule, timeSlotKey);
                const course = slot ? store.courses[slot.courseId] : undefined;

                return (
                  <td key={timeSlotKey}>
                    <ScheduleCell
                      weekday={day}
                      period={period}
                      slot={slot}
                      course={course}
                      onClick={() => onCellClick(day, period)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
