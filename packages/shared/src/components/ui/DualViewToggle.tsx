import { useEffect, useState } from "react";

import { useStorageManager } from "../../storage/context";

export const DualViewToggle = () => {
  const storageManager = useStorageManager();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const state = await storageManager.getDualView();
      setEnabled(state);
    };

    loadState();

    const unwatch = storageManager.watchDualView((newState) => {
      setEnabled(newState ?? false);
    });

    return () => {
      unwatch();
    };
  }, [storageManager]);

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
