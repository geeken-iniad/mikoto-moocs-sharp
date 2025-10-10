import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TimeDashboard } from "../ui";

export const IndexPageEnhancer = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (window.location.pathname !== "/courses") {
      return;
    }

    const mainContent = document.querySelector(".content-wrapper");
    if (mainContent) {
      const dashboardContainer = document.createElement("div");
      dashboardContainer.id = "mikoto-time-dashboard";
      dashboardContainer.style.width = "100%";
      mainContent.prepend(dashboardContainer);
      setContainer(dashboardContainer);

      return () => {
        dashboardContainer.remove();
      };
    }
  }, []);

  if (!container || window.location.pathname !== "/courses") {
    return null;
  }

  return createPortal(<TimeDashboard />, container);
};
