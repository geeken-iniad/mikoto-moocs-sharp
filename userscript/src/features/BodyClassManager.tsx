import { useEffect } from "react";
import { useSettingsContext } from "../hooks/useSettingsContext";

export const BodyClassManager = () => {
  const { settings } = useSettingsContext();

  useEffect(() => {
    const classMap = {
      "ms-rainbow-enabled": settings.enableRainbowAnimation,
      "ms-layout-enabled": settings.enableLayoutEnhancements,
      "ms-style-enabled": settings.enableStyleImprovements,
    };

    for (const [className, isEnabled] of Object.entries(classMap)) {
      document.body.classList.toggle(className, isEnabled);
    }
  }, [settings]);

  return null;
};