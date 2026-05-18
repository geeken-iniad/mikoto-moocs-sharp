import { useId } from "react";
import { CAMPUS_LABELS } from "../../constants";
import type { CampusSettings as CampusSettingsConfig } from "../../settings/types";
import {
  description,
  label,
  section,
  sectionTitle,
  select,
} from "../../styles/commonStyles";

type DefaultCampus = CampusSettingsConfig["defaultCampus"];

interface CampusSettingsProps {
  defaultCampus?: DefaultCampus;
  onCampusChange: (campus: DefaultCampus) => void;
}

export const CampusSettings = ({
  defaultCampus,
  onCampusChange,
}: CampusSettingsProps) => {
  const defaultCampusId = useId();

  return (
    <div style={section}>
      <h2 style={sectionTitle}>キャンパス設定</h2>
      <div>
        <label htmlFor={defaultCampusId} style={label}>
          デフォルトキャンパス
        </label>
        <select
          id={defaultCampusId}
          value={defaultCampus || ""}
          onChange={(e) =>
            onCampusChange(
              e.target.value ? (e.target.value as DefaultCampus) : undefined,
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
