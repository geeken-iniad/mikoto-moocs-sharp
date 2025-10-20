import type { CSSProperties } from "react";
import type { Offering, Course, Weekday, Period } from "../../types";
import { getCampusLabel } from "../../utils/schedule";

interface ScheduleCellProps {
  weekday: Weekday;
  period: Period;
  offering?: Offering;
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
};

export const ScheduleCell = ({
  offering,
  course,
  onClick,
}: ScheduleCellProps) => {
  const isEmpty = !offering || !course;

  const handleClick = () => {
    onClick();
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    Object.assign(e.currentTarget.style, styles.cellHover);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = isEmpty ? "#fafafa" : "#ffffff";
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

  // Get room information (offering rooms override course default rooms)
  const rooms = offering.rooms || course.defaultRooms || [];
  const roomText = rooms
    .map((r) => {
      const parts = [];
      if (r.campus) parts.push(getCampusLabel(r.campus));
      if (r.building) parts.push(r.building);
      parts.push(r.number);
      return parts.join(" ");
    })
    .join(", ");

  return (
    <div
      style={styles.cell}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.courseName}>{course.name}</div>
      <div style={styles.instructors}>{course.instructors.join(", ")}</div>
      {roomText && <div style={styles.room}>{roomText}</div>}
    </div>
  );
};
