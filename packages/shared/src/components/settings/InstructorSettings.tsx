import { Plus, X } from "lucide-react";
import { useState } from "react";
import {
  borderRadius,
  buttonPrimary,
  colors,
  description,
  fontSize,
  fontWeight,
  input,
  section,
  sectionTitle,
  spacing,
} from "../../styles/commonStyles";

interface InstructorSettingsProps {
  instructors: string[];
  onSave: (instructors: string[]) => void;
}

export const InstructorSettings = ({
  instructors,
  onSave,
}: InstructorSettingsProps) => {
  const [newInstructor, setNewInstructor] = useState("");

  const handleAddInstructor = () => {
    const trimmedName = newInstructor.trim();
    if (trimmedName && !instructors.includes(trimmedName)) {
      onSave([...instructors, trimmedName].sort());
      setNewInstructor("");
    }
  };

  const handleRemoveInstructor = (instructor: string) => {
    onSave(instructors.filter((i) => i !== instructor));
  };

  return (
    <div style={section}>
      <h2 style={sectionTitle}>教員名リスト管理</h2>

      <div style={{ marginBottom: spacing.lg }}>
        <div style={{ display: "flex", gap: spacing.sm, marginBottom: spacing.sm }}>
          <input
            type="text"
            value={newInstructor}
            onChange={(e) => setNewInstructor(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddInstructor();
              }
            }}
            placeholder="教員名を入力"
            style={{ ...input, flex: 1 }}
          />
          <button
            type="button"
            onClick={handleAddInstructor}
            style={buttonPrimary}
          >
            <Plus size={16} aria-hidden="true" />
            追加
          </button>
        </div>
        <p style={description}>
          登録した教員名はコース作成時にドロップダウンから選択できます
        </p>
      </div>

      {instructors.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: fontSize.base,
              fontWeight: fontWeight.semibold,
              marginBottom: spacing.sm,
              color: colors.textMedium,
            }}
          >
            登録済み教員名 ({instructors.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: spacing.sm,
            }}
          >
            {instructors.map((instructor) => (
              <div
                key={instructor}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: spacing.sm,
                  padding: "8px 12px",
                  backgroundColor: colors.bgGray,
                  borderRadius: borderRadius.xl,
                  fontSize: fontSize.base,
                }}
              >
                <span>{instructor}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInstructor(instructor)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "0",
                    color: colors.textLight,
                    display: "inline-flex",
                  }}
                  aria-label="削除"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
