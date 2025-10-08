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

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <ScheduleGrid
        getClassForCell={getClassForCell}
        onCellClick={handleCellClick}
      />

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
