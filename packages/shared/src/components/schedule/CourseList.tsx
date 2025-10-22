import { useState, type CSSProperties } from "react";
import type { Course } from "../../types";
import { useScheduleStore } from "../../hooks/schedule/useScheduleStore";
import { CourseFormModal } from "./CourseFormModal";
import { addCourse } from "../../utils/schedule";
import { useStorageManager } from "../../storage/context";

const styles: Record<string, CSSProperties> = {
  container: {
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  searchBox: {
    marginBottom: "1rem",
  },
  searchInput: {
    width: "100%",
    padding: "0.5rem",
    border: "1px solid #d1d5db",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    boxSizing: "border-box" as const,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  courseCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "0.5rem",
    padding: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  courseCardHover: {
    backgroundColor: "#f9fafb",
    borderColor: "#3b82f6",
  },
  courseName: {
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "0.25rem",
  },
  courseInstructors: {
    fontSize: "0.875rem",
    color: "#6b7280",
    marginBottom: "0.25rem",
  },
  courseCode: {
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
  courseActions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  actionButton: {
    padding: "0.25rem 0.75rem",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    cursor: "pointer",
    border: "none",
  },
  editButton: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#ffffff",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem",
    color: "#6b7280",
    backgroundColor: "#f9fafb",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
  },
};

export const CourseList = () => {
  const { store, deleteCourse } = useScheduleStore();
  const storageManager = useStorageManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const courses = Object.values(store.courses);

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) => {
    const query = searchQuery.toLowerCase();
    return (
      course.name.toLowerCase().includes(query) ||
      course.instructors.some((i) => i.toLowerCase().includes(query)) ||
      (course.code && course.code.toLowerCase().includes(query))
    );
  });

  const handleCreateCourse = async (course: Course) => {
    const newStore = addCourse(store, course);
    await storageManager.saveScheduleStore(newStore);
    setIsCreating(false);
  };

  const handleUpdateCourse = async (course: Course) => {
    const newStore = addCourse(store, course);
    await storageManager.saveScheduleStore(newStore);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    // Check if course is used in any schedule slot
    let usedInSlots = false;
    for (const schedule of Object.values(store.schedules)) {
      for (const slot of Object.values(schedule.slots)) {
        if (slot.courseId === courseId) {
          usedInSlots = true;
          break;
        }
      }
      if (usedInSlots) break;
    }

    if (usedInSlots) {
      if (
        !confirm(
          "このコースは時間割で使用されています。\n削除すると関連する時間割も削除されます。\n本当に削除しますか？",
        )
      ) {
        return;
      }
    } else {
      if (!confirm("このコースを削除してもよろしいですか？")) {
        return;
      }
    }

    await deleteCourse(courseId);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>コース管理</h2>
        <button
          type="button"
          style={styles.button}
          onClick={() => setIsCreating(true)}
        >
          + コースを作成
        </button>
      </div>

      <div style={styles.searchBox}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="コース名、教員名、科目コードで検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div style={styles.emptyState}>
          {searchQuery
            ? "検索結果が見つかりませんでした"
            : "コースがありません。新規作成してください。"}
        </div>
      ) : (
        <div style={styles.list}>
          {filteredCourses.map((course, index) => (
            <div
              key={course.id}
              style={{
                ...styles.courseCard,
                ...(hoverIndex === index ? styles.courseCardHover : {}),
              }}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div style={styles.courseName}>{course.name}</div>
              <div style={styles.courseInstructors}>
                {course.instructors.join(", ")}
              </div>
              {course.code && (
                <div style={styles.courseCode}>科目コード: {course.code}</div>
              )}
              <div style={styles.courseActions}>
                <button
                  type="button"
                  style={{ ...styles.actionButton, ...styles.editButton }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCourse(course);
                  }}
                >
                  編集
                </button>
                <button
                  type="button"
                  style={{ ...styles.actionButton, ...styles.deleteButton }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCourse(course.id);
                  }}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreating && (
        <CourseFormModal
          onSave={handleCreateCourse}
          onClose={() => setIsCreating(false)}
        />
      )}

      {editingCourse && (
        <CourseFormModal
          existingCourse={editingCourse}
          onSave={handleUpdateCourse}
          onClose={() => setEditingCourse(null)}
        />
      )}
    </div>
  );
};
