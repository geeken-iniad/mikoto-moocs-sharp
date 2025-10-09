import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSchedule } from "../hooks/useSchedule";
import { ClassEditModal } from "./ClassEditModal";
import { ScheduleGrid } from "./ScheduleGrid";

export const ScheduleEditor = () => {
  const {
    editingCell,
    editingClass,
    setEditingClass,
    getClassForCell,
    handleCellClick,
    handleSave,
    handleCancel,
    handleDelete,
    history,
  } = useSchedule();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px" }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "500",
            backgroundColor: "#3471eb",
            color: "white",
            border: "none",
            borderRadius: "7px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isCollapsed ? (
            <>
              <ChevronDown size={20} />
              時間割エディターを展開
            </>
          ) : (
            <>
              <ChevronUp size={20} />
              時間割エディターを折りたたむ
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <ScheduleGrid
          getClassForCell={getClassForCell}
          onCellClick={handleCellClick}
        />
      )}

      {editingCell && editingClass && (
        <ClassEditModal
          editingCell={editingCell}
          editingClass={editingClass}
          onClassChange={setEditingClass}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={handleCancel}
          hasExistingClass={
            !!getClassForCell(editingCell.day, editingCell.periodIndex)
          }
          history={history}
        />
      )}
    </div>
  );
};
