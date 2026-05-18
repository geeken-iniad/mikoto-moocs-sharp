interface DualViewToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const DualViewToggle = ({ enabled, onToggle }: DualViewToggleProps) => {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label="Dual view"
      className={`btn ${enabled ? "btn-warning" : "btn-default"} mikoto-dual-view-toggle`}
      onClick={onToggle}
      style={{ marginLeft: "10px" }}
    >
      <i className={enabled ? "fa fa-columns" : "fa fa-file-text-o"} /> Dual
      View
    </button>
  );
};
