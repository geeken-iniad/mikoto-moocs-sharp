import { DAY_LABELS, DAYS, PERIODS } from "../../constants";
import type { DayOfWeek } from "../../types";
import { ScheduleCell } from "./ScheduleCell";

interface ScheduleGridProps {
  getClassForCell: (day: DayOfWeek, periodIndex: number) => any;
  onCellClick: (day: DayOfWeek, periodIndex: number) => void;
}

export const ScheduleGrid = ({
  getClassForCell,
  onCellClick,
}: ScheduleGridProps) => {
  return (
    <div
      style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "80px repeat(6, 1fr)",
        gridTemplateRows: "60px repeat(6, 1fr)",
        gap: "1px",
        backgroundColor: "#ddd",
        padding: "1px",
      }}
    >
      {/* 左上の空セル */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      />

      {/* 曜日ヘッダー */}
      {DAYS.map((day) => (
        <div
          key={day}
          style={{
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          {DAY_LABELS[day]}
        </div>
      ))}

      {/* 時間割グリッド */}
      {PERIODS.map((period, periodIndex) => (
        <div key={periodIndex} style={{ display: "contents" }}>
          {/* 時限ラベル */}
          <div
            style={{
              backgroundColor: "#f5f5f5",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              padding: "8px",
            }}
          >
            <div>{period.label}</div>
            <div style={{ fontSize: "10px", color: "#666" }}>
              {period.start}
            </div>
            <div style={{ fontSize: "10px", color: "#666" }}>{period.end}</div>
          </div>

          {/* 各曜日のセル */}
          {DAYS.map((day) => (
            <ScheduleCell
              key={`${day}-${periodIndex}`}
              classData={getClassForCell(day, periodIndex)}
              onClick={() => onCellClick(day, periodIndex)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
