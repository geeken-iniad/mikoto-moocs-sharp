import { useState } from "react";
import { Plus, X } from "lucide-react";
import { settingsStyles } from "./settingsStyles";

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
    <div style={settingsStyles.section}>
      <h2 style={settingsStyles.sectionTitle}>教員名リスト管理</h2>

      <div style={{ marginBottom: "15px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
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
            style={{
              ...settingsStyles.input,
              flex: 1,
            }}
          />
          <button onClick={handleAddInstructor} style={settingsStyles.primaryButton}>
            <Plus size={16} aria-hidden="true" />
            追加
          </button>
        </div>
        <p style={settingsStyles.description}>
          登録した教員名はコース作成時にドロップダウンから選択できます
        </p>
      </div>

      {instructors.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: "600",
              marginBottom: "10px",
              color: "#333",
            }}
          >
            登録済み教員名 ({instructors.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {instructors.map((instructor) => (
              <div
                key={instructor}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "7px",
                  fontSize: "14px",
                }}
              >
                <span>{instructor}</span>
                <button
                  onClick={() => handleRemoveInstructor(instructor)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "0",
                    color: "#6b7280",
                    fontSize: "18px",
                    lineHeight: 1,
                    display: "inline-flex",
                  }}
                  title="削除"
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
