import { useState, type CSSProperties } from "react";
import { Plus, Trash2, XCircle, Check } from "lucide-react";
import type {
  Course,
  ScheduleSlot,
  Room,
  RoomType,
  DeliveryMode,
  CampusId,
} from "../../types";
import { CAMPUS_LABELS, DELIVERY_MODE_LABELS, ROOM_TYPE_LABELS } from "../../constants";

interface SlotEditModalProps {
  courses: Course[];
  existingSlot?: ScheduleSlot;
  existingCourse?: Course;
  onSave: (slotData: Partial<Omit<ScheduleSlot, "id">>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const styles: Record<string, CSSProperties> = {
  overlay: {
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
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "0.5rem",
    padding: "1.5rem",
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: "1rem",
    color: "#1f2937",
  },
  formGroup: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    marginBottom: "0.25rem",
    color: "#374151",
  },
  select: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    backgroundColor: "#ffffff",
    boxSizing: "border-box" as const,
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    minHeight: "60px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  buttonGroup: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "1.5rem",
    justifyContent: "flex-end",
  },
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  secondaryButton: {
    backgroundColor: "#6b7280",
    color: "#ffffff",
  },
  dangerButton: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  roomSection: {
    marginTop: "1rem",
    padding: "1rem",
    backgroundColor: "#f9fafb",
    borderRadius: "0.375rem",
  },
  roomHeader: {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginBottom: "0.5rem",
    color: "#374151",
  },
  addButton: {
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    padding: "0.375rem 0.75rem",
  },
};

export const SlotEditModal = ({
  courses,
  existingSlot,
  existingCourse,
  onSave,
  onDelete,
  onClose,
}: SlotEditModalProps) => {
  const [courseId, setCourseId] = useState(
    existingSlot?.courseId || existingCourse?.id || "",
  );
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | "">(
    existingSlot?.defaultDeliveryMode || "",
  );
  const [memo, setMemo] = useState(existingSlot?.memo || "");
  const [color, setColor] = useState(existingSlot?.color || "");

  const initialRooms =
    existingSlot?.rooms ||
    (existingCourse?.defaultRooms && existingCourse.defaultRooms.length > 0
      ? existingCourse.defaultRooms
      : [{ type: "physical" as RoomType, number: "" }]);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const handleSave = () => {
    if (!courseId) {
      alert("科目を選択してください");
      return;
    }

    const validRooms = rooms.filter((r) => r.number.trim());

    const slotData: Partial<Omit<ScheduleSlot, "id">> = {
      courseId,
      defaultDeliveryMode: deliveryMode || undefined,
      memo: memo.trim() || undefined,
      color: color.trim() || undefined,
      rooms: validRooms.length > 0 ? validRooms : undefined,
    };

    onSave(slotData);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { type: "physical", number: "" }]);
  };

  const handleRoomChange = (
    index: number,
    field: keyof Room,
    value: string,
  ) => {
    const newRooms = [...rooms];
    if (field === "type") {
      newRooms[index] = { ...newRooms[index], type: value as RoomType };
    } else if (field === "campus") {
      newRooms[index] = { ...newRooms[index], campus: value as CampusId };
    } else {
      newRooms[index] = { ...newRooms[index], [field]: value };
    }
    setRooms(newRooms);
  };

  const handleRemoveRoom = (index: number) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.header}>
          {existingSlot ? "授業スロットを編集" : "授業スロットを追加"}
        </h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>科目 *</label>
          <select
            style={styles.select}
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">科目を選択...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.instructors.join(", ")})
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>授業形態</label>
          <select
            style={styles.select}
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value as DeliveryMode | "")}
          >
            <option value="">デフォルト（対面）</option>
            {Object.entries(DELIVERY_MODE_LABELS).map(([mode, label]) => (
              <option key={mode} value={mode}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.roomSection}>
          <div style={styles.roomHeader}>教室（科目のデフォルト教室を上書き）</div>
          {rooms.map((room, index) => (
            <div key={index} style={{ marginBottom: "0.5rem" }}>
              <div
                style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}
              >
                <select
                  style={{ ...styles.select, flex: "1" }}
                  value={room.type}
                  onChange={(e) => handleRoomChange(index, "type", e.target.value)}
                >
                  {Object.entries(ROOM_TYPE_LABELS).map(([type, label]) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>
                {room.type === "physical" && (
                  <select
                    style={{ ...styles.select, flex: "1" }}
                    value={room.campus || ""}
                    onChange={(e) =>
                      handleRoomChange(index, "campus", e.target.value)
                    }
                  >
                    <option value="">キャンパス</option>
                    {Object.entries(CAMPUS_LABELS).map(([id, label]) => (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    ))}
                  </select>
                )}
                {room.type === "physical" && (
                  <input
                    type="text"
                    style={{ ...styles.input, flex: "1" }}
                    placeholder="建物"
                    value={room.building || ""}
                    onChange={(e) =>
                      handleRoomChange(index, "building", e.target.value)
                    }
                  />
                )}
                <input
                  type="text"
                  style={{ ...styles.input, flex: "1" }}
                  placeholder={
                    room.type === "physical" ? "部屋番号 *" : "プラットフォーム名"
                  }
                  value={room.number}
                  onChange={(e) =>
                    handleRoomChange(index, "number", e.target.value)
                  }
                />
                {rooms.length > 1 && (
                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      ...styles.dangerButton,
                      padding: "0.5rem",
                    }}
                    onClick={() => handleRemoveRoom(index)}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    削除
                  </button>
                )}
              </div>
              <input
                type="text"
                style={styles.input}
                placeholder="備考（例: 実験室、PC室）"
                value={room.note || ""}
                onChange={(e) => handleRoomChange(index, "note", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              ...styles.addButton,
            }}
            onClick={handleAddRoom}
          >
            <Plus size={16} aria-hidden="true" />
            教室を追加
          </button>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>メモ（学期全体の特記事項）</label>
          <textarea
            style={styles.textarea}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="例: 前半のみ、実験あり"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>表示色</label>
          <input
            type="color"
            style={styles.input}
            value={color || "#3b82f6"}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div style={styles.buttonGroup}>
          {existingSlot && onDelete && (
            <button
              type="button"
              style={{ ...styles.button, ...styles.dangerButton }}
              onClick={onDelete}
            >
              <Trash2 size={16} aria-hidden="true" />
              削除
            </button>
          )}
          <button
            type="button"
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
          >
            <XCircle size={16} aria-hidden="true" />
            キャンセル
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleSave}
          >
            <Check size={16} aria-hidden="true" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
