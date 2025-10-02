import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { MikotoApp } from "./components";
import "./style.css";

export default defineContentScript({
  matches: ["https://moocs.iniad.org/*"],

  main() {
    const appContainer = document.createElement("div");
    appContainer.id = "mikoto-react-root";
    appContainer.style.display = "none";
    document.body.appendChild(appContainer);

    const root = createRoot(appContainer);
    root.render(createElement(MikotoApp));

    window.addEventListener("beforeunload", () => {
      root.unmount();
      if (appContainer.parentNode) {
        appContainer.parentNode.removeChild(appContainer);
      }
    });
  },
});
