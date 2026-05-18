import { useEffect, useState } from "react";
import {
  createDefaultDualView,
  createDefaultSlideEnhancerEnabled,
} from "../../settings/defaults";
import { useStorageManager } from "../../storage/context";

export function useDualViewSetting() {
  const storageManager = useStorageManager();
  const [enabled, setEnabled] = useState(createDefaultDualView);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await storageManager.getDualView();
      if (!isActive) return;
      setEnabled(state);
    };

    loadState();

    const unwatch = storageManager.watchDualView((newState) => {
      setEnabled(newState ?? createDefaultDualView());
    });

    return () => {
      isActive = false;
      unwatch();
    };
  }, [storageManager]);

  const toggle = async () => {
    const newEnabled = !enabled;
    await storageManager.setDualView(newEnabled);
    setEnabled(newEnabled);
  };

  return { enabled, toggle };
}

export function useSlideEnhancerSetting() {
  const storageManager = useStorageManager();
  const [enabled, setEnabled] = useState(createDefaultSlideEnhancerEnabled);

  useEffect(() => {
    let isActive = true;

    const loadState = async () => {
      const state = await storageManager.getSlideEnhancerEnabled();
      if (!isActive) return;
      setEnabled(state);
    };

    loadState();

    const unwatch = storageManager.watchSlideEnhancerEnabled((newState) => {
      setEnabled(newState ?? createDefaultSlideEnhancerEnabled());
    });

    return () => {
      isActive = false;
      unwatch();
    };
  }, [storageManager]);

  const toggle = async () => {
    const newEnabled = !enabled;
    await storageManager.setSlideEnhancerEnabled(newEnabled);
    setEnabled(newEnabled);
  };

  return { enabled, toggle };
}
