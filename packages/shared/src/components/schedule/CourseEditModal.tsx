import { useState, type CSSProperties } from "react";
import type {
  Course,
  Offering,
  Room,
  Weekday,
  Period,
  CampusId,
} from "../../types";
import { DAY_LABELS, PERIODS, CAMPUS_LABELS } from "../../constants";
import { generateUUID } from "../../utils/schedule";

interface CourseEditModalProps {
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

export const CourseEditModal = ({
  weekday,
  period,
  existingOffering,
  existingCourse,
  onSave,
  onDelete,
  onClose,
}: CourseEditModalProps) => {
  const [courseName, setCourseName] = useState(existingCourse?.name || "");
  const [instructors, setInstructors] = useState(
    existingCourse?.instructors.join(", ") || "",
  );
  const [code, setCode] = useState(existingCourse?.code || "");
  const [syllabusUrl, setSyllabusUrl] = useState(
    existingCourse?.urls?.syllabus || "",
  );
  const [moocsUrl, setMoocsUrl] = useState(existingCourse?.urls?.moocs || "");
  const [toyonetUrl, setToyonetUrl] = useState(
    existingCourse?.urls?.toyonet || "",
  );
  const [slackUrl, setSlackUrl] = useState(existingCourse?.urls?.slack || "");

  // Room state (for offering-specific rooms)
  const initialRooms = existingOffering?.rooms || existingCourse?.defaultRooms || [];
  const [rooms, setRooms] = useState<Room[]>(
    initialRooms.length > 0 ? initialRooms : [{ number: "" }],
  );

  const handleSave = () => {
    if (!courseName.trim()) {
      alert("科目名を入力してください");
      return;
    }

    const instructorList = instructors
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);

    if (instructorList.length === 0) {
      alert("教員名を入力してください");
      return;
    }

    const validRooms = rooms.filter((r) => r.number.trim());

    const course: Course = {
      id: existingCourse?.id || generateUUID(),
      name: courseName.trim(),
      instructors: instructorList,
      code: code.trim() || undefined,
      urls: {
        syllabus: syllabusUrl.trim() || undefined,
        moocs: moocsUrl.trim() || undefined,
        toyonet: toyonetUrl.trim() || undefined,
        slack: slackUrl.trim() || undefined,
      },
      defaultRooms: validRooms.length > 0 ? validRooms : undefined,
    };

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
          {existingCourse ? "授業を編集" : "授業を追加"} -{" "}
          {DAY_LABELS[weekday]} {PERIODS[period].label}
        </h2>

        <div style={styles.formGroup}>
          <label style={styles.label}>科目名 *</label>
          <input
            type="text"
            style={styles.input}
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="例: プログラミング基礎"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>教員名 * (複数の場合はカンマ区切り)</label>
          <input
            type="text"
            style={styles.input}
            value={instructors}
            onChange={(e) => setInstructors(e.target.value)}
            placeholder="例: 山田太郎, 佐藤花子"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>科目コード</label>
          <input
            type="text"
            style={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="例: CS101"
          />
        </div>

        <div style={styles.roomSection}>
          <div style={styles.roomHeader}>教室</div>
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

        <div style={styles.formGroup}>
          <label style={styles.label}>シラバスURL</label>
          <input
            type="url"
            style={styles.input}
            value={syllabusUrl}
            onChange={(e) => setSyllabusUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>MOOCS URL</label>
          <input
            type="url"
            style={styles.input}
            value={moocsUrl}
            onChange={(e) => setMoocsUrl(e.target.value)}
            placeholder="https://moocs.iniad.org/..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ToyoNet URL</label>
          <input
            type="url"
            style={styles.input}
            value={toyonetUrl}
            onChange={(e) => setToyonetUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Slack URL</label>
          <input
            type="url"
            style={styles.input}
            value={slackUrl}
            onChange={(e) => setSlackUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div style={styles.buttonGroup}>
          {existingCourse && onDelete && (
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
