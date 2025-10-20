import { useState, type CSSProperties } from "react";
import type {
  Course,
  Offering,
  Room,
  Weekday,
  Period,
  CampusId,
  ScheduleStore,
} from "../../types";
import { DAY_LABELS, PERIODS, CAMPUS_LABELS } from "../../constants";
import { generateUUID } from "../../utils/schedule";

interface OfferingEditModalProps {
  store: ScheduleStore;
  weekday: Weekday;
  period: Period;
  existingOffering?: Offering;
  existingCourse?: Course;
  onSave: (course: Course, offering: Offering) => void;
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
  input: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    boxSizing: "border-box" as const,
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
  readOnly: {
    backgroundColor: "#f9fafb",
    color: "#6b7280",
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
  courseInfo: {
    padding: "0.75rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "0.375rem",
    marginBottom: "1rem",
  },
  courseInfoLabel: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginBottom: "0.25rem",
  },
  courseInfoValue: {
    fontSize: "0.875rem",
    color: "#1f2937",
    fontWeight: 500,
  },
};

export const OfferingEditModal = ({
  store,
  weekday,
  period,
  existingOffering,
  existingCourse,
  onSave,
  onDelete,
  onClose,
}: OfferingEditModalProps) => {
  const courses = Object.values(store.courses);

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    existingCourse?.id || "",
  );

  // Room state (for offering-specific rooms)
  const initialRooms = existingOffering?.rooms || existingCourse?.defaultRooms || [];
  const [rooms, setRooms] = useState<Room[]>(
    initialRooms.length > 0 ? initialRooms : [{ number: "" }],
  );

  const selectedCourse = selectedCourseId
    ? store.courses[selectedCourseId]
    : null;

  const handleSave = () => {
    if (!selectedCourseId) {
      alert("コースを選択してください");
      return;
    }

    const course = store.courses[selectedCourseId];
    if (!course) {
      alert("選択されたコースが見つかりません");
      return;
    }

    const validRooms = rooms.filter((r) => r.number.trim());

    const offering: Offering = {
      id: existingOffering?.id || generateUUID(),
      courseId: course.id,
      weekday,
      period,
      rooms: validRooms.length > 0 ? validRooms : undefined,
    };

    onSave(course, offering);
  };

  const handleAddRoom = () => {
    setRooms([...rooms, { number: "" }]);
  };

  const handleRoomChange = (
    index: number,
    field: keyof Room,
    value: string,
  ) => {
    const newRooms = [...rooms];
    if (field === "campus") {
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
          {existingOffering ? "授業を編集" : "授業を追加"} -{" "}
          {DAY_LABELS[weekday]} {PERIODS[period].label}
        </h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>曜日・時限</label>
          <input
            type="text"
            style={{ ...styles.input, ...styles.readOnly }}
            value={`${DAY_LABELS[weekday]} ${PERIODS[period].label}`}
            readOnly
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>コース *</label>
          <select
            style={styles.select}
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            disabled={!!existingOffering}
          >
            <option value="">コースを選択...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} ({course.instructors.join(", ")})
                {course.code ? ` - ${course.code}` : ""}
              </option>
            ))}
          </select>
        </div>

        {selectedCourse && (
          <div style={styles.courseInfo}>
            <div style={styles.courseInfoLabel}>選択中のコース情報</div>
            <div style={styles.courseInfoValue}>{selectedCourse.name}</div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
              教員: {selectedCourse.instructors.join(", ")}
              {selectedCourse.code && ` | 科目コード: ${selectedCourse.code}`}
            </div>
            {selectedCourse.defaultRooms && selectedCourse.defaultRooms.length > 0 && (
              <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                デフォルト教室:{" "}
                {selectedCourse.defaultRooms
                  .map((r) => {
                    const parts = [];
                    if (r.campus) parts.push(CAMPUS_LABELS[r.campus]);
                    if (r.building) parts.push(r.building);
                    parts.push(r.number);
                    return parts.join(" ");
                  })
                  .join(", ")}
              </div>
            )}
          </div>
        )}

        <div style={styles.roomSection}>
          <div style={styles.roomHeader}>
            教室
            {selectedCourse?.defaultRooms && (
              <span style={{ fontWeight: 400, fontSize: "0.75rem", marginLeft: "0.5rem" }}>
                (デフォルトの上書き)
              </span>
            )}
          </div>
          {rooms.map((room, index) => (
            <div key={index} style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
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
                <input
                  type="text"
                  style={{ ...styles.input, flex: "1" }}
                  placeholder="建物"
                  value={room.building || ""}
                  onChange={(e) =>
                    handleRoomChange(index, "building", e.target.value)
                  }
                />
                <input
                  type="text"
                  style={{ ...styles.input, flex: "1" }}
                  placeholder="部屋番号 *"
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
            style={{ ...styles.button, ...styles.secondaryButton, ...styles.addButton }}
            onClick={handleAddRoom}
          >
            + 教室を追加
          </button>
        </div>

        <div style={styles.buttonGroup}>
          {existingOffering && onDelete && (
            <button
              type="button"
              style={{ ...styles.button, ...styles.dangerButton }}
              onClick={onDelete}
            >
              削除
            </button>
          )}
          <button
            type="button"
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={handleSave}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
