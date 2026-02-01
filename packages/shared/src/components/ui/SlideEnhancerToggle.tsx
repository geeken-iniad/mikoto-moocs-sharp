import { useEffect, useState } from "react";

import { useStorageManager } from "../../storage/context";

export const SlideEnhancerToggle = () => {
  const storageManager = useStorageManager();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      const state = await storageManager.getSlideEnhancerEnabled();
      setEnabled(state);
    };

    loadState();

    const unwatch = storageManager.watchSlideEnhancerEnabled((newState) => {
      setEnabled(newState ?? false);
    });

    return () => {
      unwatch();
    };
  }, [storageManager]);

  const handleToggle = async () => {
    const newEnabled = !enabled;
    await storageManager.setSlideEnhancerEnabled(newEnabled);
    setEnabled(newEnabled);
  };

  return (
    <button
      className={`btn ${enabled ? "btn-warning" : "btn-default"} mikoto-slide-enhancer-toggle`}
      onClick={handleToggle}
      style={{ marginLeft: "10px" }}
    >
      <i className={enabled ? "fa fa-copy" : "fa fa-file-text-o"} /> Slide Copy
    </button>
  );
};
