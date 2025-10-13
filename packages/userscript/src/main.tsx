import React from "react";
import ReactDOM from "react-dom/client";
import { MikotoApp } from "./components/MikotoApp";
import indexCssContent from "@mikoto-moocs-sharp/shared/styles/index.css?inline";
import appCssContent from "@mikoto-moocs-sharp/shared/styles/App.css?inline";

// MOOCsページでのみ実行
const isMOOCsPage = window.location.hostname.includes("moocs.iniad.org");

if (isMOOCsPage) {
  const initializeApp = () => {
    // 静的CSSを手動で注入
    const style = document.createElement("style");
    style.textContent = indexCssContent + "\n" + appCssContent;
    document.head.appendChild(style);

    // アプリケーションをマウントするコンテナを作成
    const mountContainer = document.createElement("div");
    mountContainer.id = "mikoto-moocs-sharp-root";
    document.body.append(mountContainer);

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
