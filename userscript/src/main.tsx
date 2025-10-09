import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";

const rootId = "mikoto-userscript-root";

let rootContainer = document.getElementById(rootId);
if (!rootContainer) {
  rootContainer = document.createElement("div");
  rootContainer.id = rootId;
  document.body.appendChild(rootContainer);
}

ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);