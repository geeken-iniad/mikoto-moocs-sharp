import { type CSSProperties, useState } from "react";
import type { Course, Period, ScheduleSlot, Weekday } from "../../types";
import {
  getCampusLabel,
  resolveInstructors,
  resolveRooms,
} from "../../utils/schedule";
import {
  colors,
  fontSize,
  fontWeight,
} from "../../styles/commonStyles";

interface ScheduleCellProps {
  weekday: Weekday;
  period: Period;
  slot?: ScheduleSlot;
  course?: Course;
  onClick: () => void;
}

const styles: Record<string, CSSProperties> = {
  cell: {
    border: `1px solid ${colors.borderDark}`,
    padding: "14px",
    minHeight: "120px",
    cursor: "pointer",
    backgroundColor: colors.bgWhite,
    transition: "all 0.2s",
    position: "relative",
  },
  cellHover: {
    backgroundColor: colors.bgGray,
  },
  cellEmpty: {
    backgroundColor: "#fafafa",
    color: colors.textMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fontSize["2xl"],
  },
  courseName: {
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    marginBottom: "8px",
    color: colors.textDark,
    lineHeight: "1.5",
  },
  instructors: {
    fontSize: fontSize.base,
    color: colors.textLight,
    marginBottom: "6px",
    lineHeight: "1.5",
  },
  room: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: "1.5",
  },
  memo: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    marginTop: "4px",
    fontStyle: "italic",
  },
};

export const ScheduleCell = ({ slot, course, onClick }: ScheduleCellProps) => {
  const isEmpty = !slot || !course;
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick();
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const baseCellStyle: CSSProperties = isEmpty
    ? { ...styles.cell, ...styles.cellEmpty }
    : {
        ...styles.cell,
        ...(slot?.color ? { backgroundColor: slot.color } : {}),
      };

  const cellStyle: CSSProperties = isHovered
    ? { ...baseCellStyle, ...styles.cellHover }
    : baseCellStyle;

  if (isEmpty) {
    return (
      <div
        style={cellStyle}
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
