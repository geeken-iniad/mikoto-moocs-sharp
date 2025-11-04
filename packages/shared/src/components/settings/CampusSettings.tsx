import type { CampusId } from "../../types";
import { CAMPUS_LABELS } from "../../constants";

interface CampusSettingsProps {
  defaultCampus?: CampusId;
  onCampusChange: (campus: CampusId | undefined) => void;
}

export const CampusSettings = ({
  defaultCampus,
  onCampusChange,
}: CampusSettingsProps) => {
  return (
    <div style={{ padding: "20px", borderBottom: "1px solid #dcdfe6" }}>
      <h2 style={{ marginBottom: "15px" }}>キャンパス設定</h2>
      <div style={{ marginBottom: "10px" }}>
        <label
          htmlFor="default-campus"
          style={{
            display: "block",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#333",
          }}
        >
          デフォルトキャンパス
        </label>
        <select
          id="default-campus"
          value={defaultCampus || ""}
          onChange={(e) =>
            onCampusChange(
              e.target.value ? (e.target.value as CampusId) : undefined,
            )
          }
          style={{
            padding: "10px",
            fontSize: "14px",
            border: "1px solid #dcdfe6",
            borderRadius: "7px",
            backgroundColor: "white",
            cursor: "pointer",
            minWidth: "200px",
          }}
        >
          <option value="">未設定</option>
          {Object.entries(CAMPUS_LABELS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          新しい教室を追加する際のデフォルトキャンパスを設定します
        </p>
      </div>
    </div>
  );
};
