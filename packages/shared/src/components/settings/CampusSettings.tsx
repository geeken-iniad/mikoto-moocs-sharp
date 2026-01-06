import type { CampusId } from "../../types";
import { CAMPUS_LABELS } from "../../constants";
import { settingsStyles } from "./settingsStyles";

interface CampusSettingsProps {
  defaultCampus?: CampusId;
  onCampusChange: (campus: CampusId | undefined) => void;
}

export const CampusSettings = ({
  defaultCampus,
  onCampusChange,
}: CampusSettingsProps) => {
  return (
    <div style={settingsStyles.section}>
      <h2 style={settingsStyles.sectionTitle}>キャンパス設定</h2>
      <div style={{ marginBottom: "10px" }}>
        <label htmlFor="default-campus" style={settingsStyles.label}>
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
            ...settingsStyles.input,
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
        <p style={settingsStyles.description}>
          新しい教室を追加する際のデフォルトキャンパスを設定します
        </p>
      </div>
    </div>
  );
};
