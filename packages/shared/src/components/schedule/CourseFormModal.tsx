import { useState, useEffect, type CSSProperties } from "react";
import { Plus, Trash2, X, XCircle, Check } from "lucide-react";
import type { Course, Room, CampusId, RoomType } from "../../types";
import { CAMPUS_LABELS, ROOM_TYPE_LABELS } from "../../constants";
import { generateUUID } from "../../utils/schedule";
import { useStorageManager } from "../../storage/context";

interface CourseFormModalProps {
  existingCourse?: Course;
  onSave: (course: Course) => void;
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
  selectedInstructorList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  selectedInstructorChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.25rem 0.5rem",
    backgroundColor: "#e5e7eb",
    borderRadius: "0.25rem",
    fontSize: "0.875rem",
  },
  removeInstructorButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "0",
    color: "#6b7280",
    display: "inline-flex",
  },
};

export const CourseFormModal = ({
  existingCourse,
  onSave,
  onClose,
}: CourseFormModalProps) => {
  const storageManager = useStorageManager();
  const [courseName, setCourseName] = useState(existingCourse?.name || "");
  const [code, setCode] = useState(existingCourse?.code || "");
  const [moocsUrl, setMoocsUrl] = useState(existingCourse?.urls?.moocs || "");
  const [classroomUrl, setClassroomUrl] = useState(
    existingCourse?.urls?.classroom || "",
  );
  const [toyonetAceUrl, setToyonetAceUrl] = useState(
    existingCourse?.urls?.toyonetAce || "",
  );
  const [slackUrl, setSlackUrl] = useState(existingCourse?.urls?.slack || "");
  const [syllabusUrl, setSyllabusUrl] = useState(
    existingCourse?.urls?.syllabus || "",
  );

  // Default rooms state
  const initialRooms = existingCourse?.defaultRooms || [];
  const [rooms, setRooms] = useState<Room[]>(
    initialRooms.length > 0 ? initialRooms : [{ type: "physical", number: "" }],
  );
  const [defaultCampus, setDefaultCampus] = useState<CampusId | undefined>(
    undefined,
  );
  const [availableInstructors, setAvailableInstructors] = useState<string[]>(
    [],
  );
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>(
    existingCourse?.instructors || [],
  );
  const [customInstructor, setCustomInstructor] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await storageManager.getCampusSettings();
      const instructors = await storageManager.getInstructors();
      setDefaultCampus(settings.defaultCampus);
      setAvailableInstructors(instructors);
    };
    loadSettings();
  }, [storageManager]);

  const handleSave = async () => {
    if (!courseName.trim()) {
      alert("科目名を入力してください");
      return;
    }

    // カスタム入力から教員名を追加
    const customInstructorList = customInstructor
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i);

    const instructorList = [
      ...selectedInstructors,
      ...customInstructorList,
    ].filter((i) => i);

    if (instructorList.length === 0) {
      alert("教員名を選択または入力してください");
      return;
    }

    // 新しい教員名をリストに追加
    if (customInstructorList.length > 0) {
      await storageManager.addInstructors(customInstructorList);
    }

    const validRooms = rooms.filter((r) => r.number.trim());

    const course: Course = {
      id: existingCourse?.id || generateUUID(),
      name: courseName.trim(),
      instructors: instructorList,
      code: code.trim() || undefined,
      urls: {
        moocs: moocsUrl.trim() || undefined,
        classroom: classroomUrl.trim() || undefined,
        toyonetAce: toyonetAceUrl.trim() || undefined,
        slack: slackUrl.trim() || undefined,
        syllabus: syllabusUrl.trim() || undefined,
      },
      defaultRooms: validRooms.length > 0 ? validRooms : undefined,
    };

    onSave(course);
  };

  const handleAddRoom = () => {
    const newRoom: Room = {
      type: "physical",
      number: "",
      campus: defaultCampus,
    };
    setRooms([...rooms, newRoom]);
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

  const handleInstructorSelect = (instructor: string) => {
    if (!selectedInstructors.includes(instructor)) {
      setSelectedInstructors([...selectedInstructors, instructor]);
    }
  };

  const handleRemoveInstructor = (instructor: string) => {
    setSelectedInstructors(
      selectedInstructors.filter((i) => i !== instructor),
    );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.header}>
          {existingCourse ? "コースを編集" : "コースを作成"}
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
          <label style={styles.label}>教員名 *</label>

          {/* 選択された教員名を表示 */}
          {selectedInstructors.length > 0 && (
            <div style={styles.selectedInstructorList}>
              {selectedInstructors.map((instructor, index) => (
                <div
                  key={index}
                  style={styles.selectedInstructorChip}
                >
                  <span>{instructor}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInstructor(instructor)}
                    style={styles.removeInstructorButton}
                    aria-label="教員を削除"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ドロップダウンで教員名を選択 */}
          {availableInstructors.length > 0 && (
            <select
              style={{ ...styles.select, marginBottom: "0.5rem" }}
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleInstructorSelect(e.target.value);
                  e.target.value = "";
                }
              }}
            >
              <option value="">リストから選択...</option>
              {availableInstructors
                .filter((i) => !selectedInstructors.includes(i))
                .map((instructor) => (
                  <option key={instructor} value={instructor}>
                    {instructor}
                  </option>
                ))}
            </select>
          )}

          {/* カスタム教員名入力 */}
          <input
            type="text"
            style={styles.input}
            value={customInstructor}
            onChange={(e) => setCustomInstructor(e.target.value)}
            placeholder="新しい教員名を入力 (複数の場合はカンマ区切り)"
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
          <div style={styles.roomHeader}>デフォルト教室（任意）</div>
          {rooms.map((room, index) => (
            <div key={index} style={{ marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.25rem" }}>
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
                  <>
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
                  </>
                )}
                <input
                  type="text"
                  style={{ ...styles.input, flex: "1" }}
                  placeholder={room.type === "physical" ? "部屋番号 *" : "プラットフォーム名"}
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
            style={{ ...styles.button, ...styles.secondaryButton, ...styles.addButton }}
            onClick={handleAddRoom}
          >
            <Plus size={16} aria-hidden="true" />
            教室を追加
          </button>
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
          <label style={styles.label}>Google Classroom URL</label>
          <input
            type="url"
            style={styles.input}
            value={classroomUrl}
            onChange={(e) => setClassroomUrl(e.target.value)}
            placeholder="https://classroom.google.com/..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>ToyoNet-ACE URL</label>
          <input
            type="url"
            style={styles.input}
            value={toyonetAceUrl}
            onChange={(e) => setToyonetAceUrl(e.target.value)}
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

        <div style={styles.buttonGroup}>
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
