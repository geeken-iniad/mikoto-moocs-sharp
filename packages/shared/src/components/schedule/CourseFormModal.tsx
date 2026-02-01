import { Check, Plus, Trash2, X, XCircle } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { CAMPUS_LABELS, ROOM_TYPE_LABELS } from "../../constants";
import { useStorageManager } from "../../storage/context";
import type { CampusId, Course, Room, RoomType } from "../../types";
import { generateUUID } from "../../utils/schedule";
import {
  borderRadius,
  colors,
  fontSize,
  fontWeight,
  spacing,
} from "../../styles/commonStyles";

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
    backgroundColor: colors.bgWhite,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    maxWidth: "600px",
    width: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
  },
  header: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
    color: colors.textDark,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    display: "block",
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
    color: colors.textMedium,
  },
  input: {
    width: "100%",
    padding: "10px",
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    fontSize: fontSize.base,
    boxSizing: "border-box" as const,
    backgroundColor: colors.bgWhite,
  },
  select: {
    width: "100%",
    padding: "10px",
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    fontSize: fontSize.base,
    backgroundColor: colors.bgWhite,
    boxSizing: "border-box" as const,
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    gap: spacing.sm,
    marginTop: spacing.lg,
    justifyContent: "flex-end",
  },
  button: {
    padding: "10px 20px",
    borderRadius: borderRadius.xl,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    cursor: "pointer",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    color: colors.bgWhite,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    color: colors.bgWhite,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    color: colors.bgWhite,
  },
  roomSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.bgLight,
    borderRadius: borderRadius.xl,
  },
  roomHeader: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    color: colors.textMedium,
  },
  addButton: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    padding: "8px 16px",
  },
  selectedInstructorList: {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedInstructorChip: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xs,
    padding: "6px 12px",
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.md,
    fontSize: fontSize.base,
  },
  removeInstructorButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: "0",
    color: colors.textLight,
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
  const [selectedInstructorOption, setSelectedInstructorOption] = useState("");

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

    // Add new instructor names to the list
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
    setSelectedInstructors(selectedInstructors.filter((i) => i !== instructor));
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

          {/* Display selected instructors */}
          {selectedInstructors.length > 0 && (
            <div style={styles.selectedInstructorList}>
              {selectedInstructors.map((instructor, index) => (
                <div key={index} style={styles.selectedInstructorChip}>
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

          {/* Select instructor from dropdown */}
          {availableInstructors.length > 0 && (
            <select
              style={{ ...styles.select, marginBottom: spacing.sm }}
              value={selectedInstructorOption}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setSelectedInstructorOption(value);
                  return;
                }
                handleInstructorSelect(value);
                setSelectedInstructorOption("");
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

          {/* Custom instructor name input */}
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
            <div key={index} style={{ marginBottom: spacing.sm }}>
              <div
                style={{
                  display: "flex",
                  gap: spacing.sm,
                  marginBottom: spacing.xs,
                }}
              >
                <select
                  style={{ ...styles.select, flex: "1" }}
                  value={room.type}
                  onChange={(e) =>
                    handleRoomChange(index, "type", e.target.value)
                  }
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
                  placeholder={
                    room.type === "physical"
                      ? "部屋番号 *"
                      : "プラットフォーム名"
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
                onChange={(e) =>
                  handleRoomChange(index, "note", e.target.value)
                }
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
          <label style={styles.label}>MOOCs URL</label>
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
