import React from "react";
import ReactDOM from "react-dom/client";
import { MikotoApp } from "./components/MikotoApp";
import "./index.css";

// MOOCsページでのみ実行
const isMOOCsPage = window.location.hostname.includes("moocs.iniad.org");

if (isMOOCsPage) {
  const initializeApp = () => {
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
