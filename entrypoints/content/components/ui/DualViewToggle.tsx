import React, { useEffect, useState } from "react";

const DUAL_VIEW_STORAGE_KEY = "mikoto-dual-view";

export const DualViewToggle: React.FC = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const state = await storage.getItem<boolean>(
        `local:${DUAL_VIEW_STORAGE_KEY}`,
      );
      setEnabled(state || false);
    };

    loadState();

    const unwatch = storage.watch<boolean>(
      `local:${DUAL_VIEW_STORAGE_KEY}`,
      (newState) => {
        setEnabled(newState || false);
      },
    );

    return () => {
      unwatch();
    };
  }, []);

  const handleToggle = async () => {
    const newEnabled = !enabled;
    await storage.setItem(`local:${DUAL_VIEW_STORAGE_KEY}`, newEnabled);
    setEnabled(newEnabled);
  };

  return (
    <button
      className={`btn ${enabled ? "btn-warning" : "btn-default"} mikoto-dual-view-toggle`}
      onClick={handleToggle}
      style={{ marginLeft: "10px" }}
    >
      <i className={enabled ? "fa fa-columns" : "fa fa-file-text-o"} /> Dual
      View
    </button>
  );
};
