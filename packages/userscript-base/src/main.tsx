import contentCssContent from "@mikoto-moocs-sharp/shared/styles/content.scss?raw";
import React from "react";
import ReactDOM from "react-dom/client";
import { GM_registerMenuCommand } from "$";
import { MikotoApp } from "./components/MikotoApp";
import { createStorageManager } from "./utils/storage";

// 設定モーダルの状態管理
let setSettingsModalOpen: ((open: boolean) => void) | null = null;

// グローバルにsetterを公開
window.__mikotoRegisterSettingsModalSetter = (setter: (open: boolean) => void) => {
  setSettingsModalOpen = setter;
};

/**
 * Initialize Mikoto MOOCs# application
 */
export function initializeMikoto() {
  // MOOCsページでのみ実行
  const isMOOCsPage = window.location.hostname.includes("moocs.iniad.org");

  if (isMOOCsPage) {
    // GM_registerMenuCommandを早期に登録
    GM_registerMenuCommand("⚙️ 設定を開く", () => {
      if (setSettingsModalOpen) {
        setSettingsModalOpen(true);
      }
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
          <MikotoApp storageManager={storageManager} />
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
