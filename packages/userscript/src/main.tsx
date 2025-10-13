import React from "react";
import ReactDOM from "react-dom/client";
import { MikotoApp } from "./components/MikotoApp";
import contentCssContent from "@mikoto-moocs-sharp/shared/styles/content.css?raw";

// MOOCsページでのみ実行
const isMOOCsPage = window.location.hostname.includes("moocs.iniad.org");

if (isMOOCsPage) {
  const initializeApp = () => {
    console.log("[Mikoto (MOOCs #)]: Initializing app...");

    // 静的CSSを手動で注入
    const style = document.createElement("style");
    style.setAttribute("data-mikoto-styles", "true");
    style.textContent = contentCssContent;
    document.head.appendChild(style);
    console.log("[Mikoto (MOOCs #)]: CSS injected, length:", style.textContent.length);

    // アプリケーションをマウントするコンテナを作成
    const mountContainer = document.createElement("div");
    mountContainer.id = "mikoto-react-root";
    document.body.append(mountContainer);
    console.log("[Mikoto (MOOCs #)]: Root container created:", mountContainer);

    // Reactアプリケーションをマウント
    ReactDOM.createRoot(mountContainer).render(
      <React.StrictMode>
        <MikotoApp />
      </React.StrictMode>,
    );

    console.log("[Mikoto (MOOCs #)]: Userscript loaded successfully");
  };

  // DOMが完全に読み込まれてから実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
}
