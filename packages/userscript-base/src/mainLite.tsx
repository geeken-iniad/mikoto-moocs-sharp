import contentCssContent from "@mikoto-moocs-sharp/shared/styles/content.scss?raw";
import React from "react";
import ReactDOM from "react-dom/client";
import { GM_registerMenuCommand } from "$";
import { MikotoAppLite } from "./components/MikotoAppLite";
import { openSettingsModal } from "./settings/modalController";
import { createStorageManager } from "./utils/storage";

/**
 * Initialize Mikoto MOOCs# Lite application
 */
export function initializeMikotoLite() {
  // MOOCsページでのみ実行
  const isMOOCsPage = window.location.hostname.includes("moocs.iniad.org");

  if (isMOOCsPage) {
    // GM_registerMenuCommandを早期に登録
    GM_registerMenuCommand("⚙️ 設定を開く", () => {
      openSettingsModal();
    });

    const initializeApp = () => {
      // 静的CSSを手動で注入
      const style = document.createElement("style");
      style.setAttribute("data-mikoto-styles", "true");
      style.textContent = contentCssContent;
      document.head.appendChild(style);

      // アプリケーションをマウントするコンテナを作成
      const mountContainer = document.createElement("div");
      mountContainer.id = "mikoto-react-root";
      document.body.append(mountContainer);

      // StorageManagerを作成
      const storageManager = createStorageManager();

      // Reactアプリケーションをマウント
      ReactDOM.createRoot(mountContainer).render(
        <React.StrictMode>
          <MikotoAppLite storageManager={storageManager} />
        </React.StrictMode>,
      );
    };

    // DOMが完全に読み込まれてから実行
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initializeApp);
    } else {
      initializeApp();
    }
  }
}
