import { useState } from "react";

import type { Class } from "../../types";

interface ScheduleCellProps {
  classData: Class | null;
  onClick: () => void;
}

export const ScheduleCell = ({ classData, onClick }: ScheduleCellProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: classData
          ? "#e3f2fd"
          : isHovered
            ? "#f5f5f5"
            : "white",
        padding: "12px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        overflow: "hidden",
      }}
    >
      {classData && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {classData.subject}
          </div>
          {classData.teacher && (
            <div
              style={{
                fontSize: "12px",
                color: "#666",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {classData.teacher}
            </div>
          )}
          {classData.room && (
            <div
              style={{
                fontSize: "11px",
                color: "#999",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {classData.room}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
