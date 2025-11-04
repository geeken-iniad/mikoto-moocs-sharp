import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Course } from "../../types";
import { useScheduleStore } from "../../hooks/schedule/useScheduleStore";
import { useStorageManager } from "../../storage/context";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { isCourseUsed } from "../../utils/schedule";
import { getCurrentAndNextClass } from "../../utils/currentClass";
import { CourseFormModal } from "./CourseFormModal";

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
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
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
    border: "1px solid #3b82f6",
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
    display: "inline-flex",
    alignItems: "center",
    gap: "0.375rem",
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
  currentClassCard: {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  nextClassCard: {
    backgroundColor: "#f0fdf4",
    border: "2px solid #22c55e",
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2)",
  },
  classBadge: {
    position: "absolute" as const,
    top: "0.5rem",
    right: "0.5rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "0.25rem",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  currentBadge: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
  },
  nextBadge: {
    backgroundColor: "#22c55e",
    color: "#ffffff",
  },
  courseCardWrapper: {
    position: "relative" as const,
  },
};

export const CourseList = () => {
  const { store, createCourse, updateCourse, deleteCourse } =
    useScheduleStore();
  const storageManager = useStorageManager();
  const currentTime = useCurrentTime();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [activeScheduleId, setActiveScheduleId] = useState<string | null>(null);

  // Load active schedule ID on mount
  useEffect(() => {
    const loadActiveSchedule = async () => {
      const activeId = await storageManager.getActiveScheduleId();
      setActiveScheduleId(activeId);
    };
    loadActiveSchedule();
  }, [storageManager]);

  // Watch for changes to active schedule ID
  useEffect(() => {
    const unwatch = storageManager.watchActiveScheduleId((newActiveId) => {
      setActiveScheduleId(newActiveId);
    });
    return unwatch;
  }, [storageManager]);

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

  const { current: currentClassInfo, next: nextClassInfo } = useMemo(
    () => getCurrentAndNextClass(store, activeScheduleId, currentTime),
    [store, activeScheduleId, currentTime],
  );

  const handleCreateCourse = async (course: Course) => {
    await createCourse(course);
    setIsCreating(false);
  };

  const handleUpdateCourse = async (course: Course) => {
    await updateCourse(course.id, course);
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    // Check if course is used in any schedule slot
    const usedInSlots = isCourseUsed(store, courseId);
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
          <Plus size={16} aria-hidden="true" />
          コースを作成
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
          {filteredCourses.map((course, index) => {
            const classStatus =
              currentClassInfo?.courseId === course.id
                ? "current"
                : nextClassInfo?.courseId === course.id
                  ? "next"
                  : null;

            let statusStyle = {};
            if (classStatus === "current") {
              statusStyle = styles.currentClassCard;
            } else if (classStatus === "next") {
              statusStyle = styles.nextClassCard;
            }

            return (
              <div key={course.id} style={styles.courseCardWrapper}>
                <div
                  style={{
                    ...styles.courseCard,
                    ...(hoverIndex === index ? styles.courseCardHover : {}),
                    ...statusStyle,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {classStatus && (
                    <div
                      style={{
                        ...styles.classBadge,
                        ...(classStatus === "current"
                          ? styles.currentBadge
                          : styles.nextBadge),
                      }}
                    >
                      {classStatus === "current" ? "今" : "次"}
                    </div>
                  )}
                  <div style={styles.courseName}>{course.name}</div>
                  <div style={styles.courseInstructors}>
                    {course.instructors.join(", ")}
                  </div>
                  {course.code && (
                    <div style={styles.courseCode}>
                      科目コード: {course.code}
                    </div>
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
                      <Pencil size={14} aria-hidden="true" />
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
                      <Trash2 size={14} aria-hidden="true" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
