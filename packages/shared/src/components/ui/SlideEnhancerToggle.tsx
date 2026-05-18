interface SlideEnhancerToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const SlideEnhancerToggle = ({
  enabled,
  onToggle,
}: SlideEnhancerToggleProps) => {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      aria-label="Slide copy enhancer"
      className={`btn ${enabled ? "btn-warning" : "btn-default"} mikoto-slide-enhancer-toggle`}
      onClick={onToggle}
      style={{ marginLeft: "10px" }}
    >
      <i className={enabled ? "fa fa-copy" : "fa fa-file-text-o"} /> Slide Copy
    </button>
  );
};
