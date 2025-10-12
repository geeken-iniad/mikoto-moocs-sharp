import React, { useEffect, useState } from "react";
import type { StorageManager } from "../../storage/manager";

export const createDualViewToggle = (storageManager: StorageManager) => {
  return () => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
      const loadState = async () => {
        const state = await storageManager.getDualView();
        setEnabled(state);
      };

      loadState();

      const unwatch = storageManager.watchDualView((newState) => {
        setEnabled(newState || false);
      });

      return () => {
        unwatch();
      };
    }, []);

    const handleToggle = async () => {
      const newEnabled = !enabled;
      await storageManager.setDualView(newEnabled);
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
};
