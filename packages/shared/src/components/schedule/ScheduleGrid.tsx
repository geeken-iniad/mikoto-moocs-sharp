import type { CSSProperties } from "react";
import type { ScheduleStore, Schedule, Weekday, Period } from "../../types";
import { DAYS, DAY_LABELS, PERIODS } from "../../constants";
import { createTimeSlotKey, getSlotByTimeSlot } from "../../utils/schedule";
import { ScheduleCell } from "./ScheduleCell";

interface ScheduleGridProps {
  store: ScheduleStore;
  schedule: Schedule;
  onCellClick: (weekday: Weekday, period: Period) => void;
}

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
    overflowX: "auto",
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  headerCell: {
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
    fontWeight: 600,
    textAlign: "center",
    color: "#374151",
    fontSize: "1.125rem",
  },
  periodHeader: {
    width: "120px",
  },
  dayHeader: {
    minWidth: "200px",
  },
  periodCell: {
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRight: "1px solid #e5e7eb",
    fontWeight: 500,
    textAlign: "center",
    color: "#6b7280",
    fontSize: "1.0625rem",
  },
  periodTime: {
    fontSize: "0.9375rem",
    color: "#9ca3af",
    marginTop: "0.375rem",
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
