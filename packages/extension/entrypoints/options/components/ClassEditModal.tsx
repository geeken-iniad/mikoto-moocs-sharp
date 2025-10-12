import { Save, Trash2, X } from "lucide-react";
import type { Class } from "@mikoto-moocs/shared";
import type { EditingCell } from "../hooks/useSchedule";
import type { ScheduleHistory } from "../hooks/useScheduleHistory";
import { DAY_LABELS, PERIODS } from "./constants";

interface ClassEditModalProps {
  editingCell: EditingCell;
  editingClass: Class;
  onClassChange: (updatedClass: Class) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  hasExistingClass: boolean;
  history: ScheduleHistory;
}

export const ClassEditModal = ({
  editingCell,
  editingClass,
  onClassChange,
  onSave,
  onDelete,
  onCancel,
  hasExistingClass,
  history,
}: ClassEditModalProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          width: "500px",
          maxWidth: "90%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>
          {DAY_LABELS[editingCell.day]}曜日{" "}
          {PERIODS[editingCell.periodIndex].label}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              科目名
            </label>
            <input
              type="text"
              list="subject-list"
              value={editingClass.subject}
              onChange={(e) =>
                onClassChange({
                  ...editingClass,
                  subject: e.target.value,
                })
              }
              placeholder="例: 情報数学"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <datalist id="subject-list">
              {history.subjects.map((subject, idx) => (
                <option key={idx} value={subject} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              教員名
            </label>
            <input
              type="text"
              list="teacher-list"
              value={editingClass.teacher || ""}
              onChange={(e) =>
                onClassChange({
                  ...editingClass,
                  teacher: e.target.value,
                })
              }
              placeholder="例: 山田太郎"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <datalist id="teacher-list">
              {history.teachers.map((teacher, idx) => (
                <option key={idx} value={teacher} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              教室
            </label>
            <input
              type="text"
              list="room-list"
              value={editingClass.room || ""}
              onChange={(e) =>
                onClassChange({ ...editingClass, room: e.target.value })
              }
              placeholder="例: A101"
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
            <datalist id="room-list">
              {history.rooms.map((room, idx) => (
                <option key={idx} value={room} />
              ))}
            </datalist>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <button
              onClick={onSave}
              style={{
                flex: 1,
                padding: "10px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              <Save size={18} />
              保存
            </button>
            {hasExistingClass && (
              <button
                onClick={onDelete}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Trash2 size={18} />
                削除
              </button>
            )}
            <button
              onClick={onCancel}
              style={{
                padding: "10px 20px",
                backgroundColor: "#999",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <X size={18} />
              キャンセル
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
