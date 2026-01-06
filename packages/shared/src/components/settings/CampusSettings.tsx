import type { CampusId } from "../../types";
import { CAMPUS_LABELS } from "../../constants";
import {
  section,
  sectionTitle,
  label,
  select,
  description,
} from "../../styles/commonStyles";

interface CampusSettingsProps {
  defaultCampus?: CampusId;
  onCampusChange: (campus: CampusId | undefined) => void;
}

export const CampusSettings = ({
  defaultCampus,
  onCampusChange,
}: CampusSettingsProps) => {
  return (
    <div style={section}>
      <h2 style={sectionTitle}>キャンパス設定</h2>
      <div>
        <label htmlFor="default-campus" style={label}>
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
          style={select}
        >
          <option value="">未設定</option>
          {Object.entries(CAMPUS_LABELS).map(([id, labelText]) => (
            <option key={id} value={id}>
              {labelText}
            </option>
          ))}
        </select>
        <p style={description}>
          新しい教室を追加する際のデフォルトキャンパスを設定します
        </p>
      </div>
    </div>
  );
};
