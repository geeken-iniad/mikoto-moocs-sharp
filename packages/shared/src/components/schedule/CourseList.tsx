import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Course } from "../../types";
import { useScheduleStore } from "../../hooks/schedule/useScheduleStore";
import { useStorageManager } from "../../storage/context";
import { useCurrentTime } from "../../hooks/useCurrentTime";
import { isCourseUsed } from "../../utils/schedule";
import { getCurrentAndNextClass } from "../../utils/currentClass";
import { CourseFormModal } from "./CourseFormModal";
import {
  section,
  sectionTitle,
  buttonPrimary,
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../styles/commonStyles";

const styles: Record<string, CSSProperties> = {
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  searchBox: {
    marginBottom: spacing.md,
  },
  searchInput: {
    width: "100%",
    padding: "10px",
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.xl,
    fontSize: fontSize.sm,
    boxSizing: "border-box" as const,
    backgroundColor: colors.bgWhite,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.sm,
  },
  courseCard: {
    backgroundColor: colors.bgWhite,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  courseCardHover: {
    backgroundColor: colors.bgLight,
    border: `1px solid ${colors.primary}`,
  },
  courseName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.xs,
  },
  courseInstructors: {
    fontSize: fontSize.base,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  courseCode: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  courseActions: {
    display: "flex",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    padding: "6px 12px",
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    cursor: "pointer",
    border: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: spacing.xs,
  },
  editButton: {
    backgroundColor: colors.primary,
    color: colors.bgWhite,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    color: colors.bgWhite,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "3rem",
    color: colors.textLight,
    backgroundColor: colors.bgLight,
    borderRadius: borderRadius.xl,
    border: `1px solid ${colors.borderLight}`,
    fontSize: fontSize.base,
  },
  currentClassCard: {
    backgroundColor: colors.bgBlueLight,
    border: `2px solid ${colors.primary}`,
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  nextClassCard: {
    backgroundColor: colors.bgGreenLight,
    border: `2px solid ${colors.success}`,
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.2)",
  },
  classBadge: {
    position: "absolute" as const,
    top: spacing.sm,
    right: spacing.sm,
    padding: "6px 12px",
    borderRadius: borderRadius.md,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  currentBadge: {
    backgroundColor: colors.primary,
    color: colors.bgWhite,
  },
  nextBadge: {
    backgroundColor: colors.success,
    color: colors.bgWhite,
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
    <div style={section}>
      <div style={styles.headerRow}>
        <h2 style={sectionTitle}>コース管理</h2>
        <button
          type="button"
          style={buttonPrimary}
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
