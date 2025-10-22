import type { CSSProperties } from "react";
import type { ScheduleSlot, Course, Weekday, Period } from "../../types";
import { getCampusLabel, resolveRooms, resolveInstructors } from "../../utils/schedule";

interface ScheduleCellProps {
  weekday: Weekday;
  period: Period;
  slot?: ScheduleSlot;
  course?: Course;
  onClick: () => void;
}

const styles: Record<string, CSSProperties> = {
  cell: {
    border: "1px solid #d1d5db",
    padding: "0.875rem",
    minHeight: "120px",
    cursor: "pointer",
    backgroundColor: "#ffffff",
    transition: "all 0.2s",
    position: "relative",
  },
  cellHover: {
    backgroundColor: "#f3f4f6",
  },
  cellEmpty: {
    backgroundColor: "#fafafa",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  courseName: {
    fontWeight: 600,
    fontSize: "1.125rem",
    marginBottom: "0.5rem",
    color: "#1f2937",
    lineHeight: "1.5",
  },
  instructors: {
    fontSize: "1rem",
    color: "#6b7280",
    marginBottom: "0.375rem",
    lineHeight: "1.5",
  },
  room: {
    fontSize: "0.9375rem",
    color: "#9ca3af",
    lineHeight: "1.5",
  },
  memo: {
    fontSize: "0.8125rem",
    color: "#6b7280",
    marginTop: "0.25rem",
    fontStyle: "italic",
  },
};

export const ScheduleCell = ({
  slot,
  course,
  onClick,
}: ScheduleCellProps) => {
  const isEmpty = !slot || !course;

  const handleClick = () => {
    onClick();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    Object.assign(e.currentTarget.style, styles.cellHover);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = isEmpty ? "#fafafa" : (slot?.color || "#ffffff");
  };

  if (isEmpty) {
    return (
      <div
        style={{ ...styles.cell, ...styles.cellEmpty }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        +
      </div>
    );
  }

  // Resolve display information
  const rooms = resolveRooms(course, slot);
  const instructors = resolveInstructors(course, slot);

  const roomText = rooms
    .map((r) => {
      const parts = [];
      if (r.type === "physical") {
        if (r.campus) parts.push(getCampusLabel(r.campus));
        if (r.building) parts.push(r.building);
        parts.push(r.number);
      } else {
        parts.push(r.number); // Online/On-demand platform name
      }
      return parts.join(" ");
    })
    .join(", ");

  const cellStyle: CSSProperties = {
    ...styles.cell,
    ...(slot.color ? { backgroundColor: slot.color } : {}),
  };

  return (
    <div
      style={cellStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.courseName}>{course.name}</div>
      <div style={styles.instructors}>{instructors.join(", ")}</div>
      {roomText && <div style={styles.room}>{roomText}</div>}
      {slot.memo && <div style={styles.memo}>{slot.memo}</div>}
    </div>
  );
};
