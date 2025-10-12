import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import { MikotoApp } from "./components";
import "./style.css";
import { storageManager } from "../utils/storage";

const ROOT_CONTAINER_ID = "mikoto-react-root";
const TARGET_URL_PATTERNS = [
  "https://moocs.iniad.org/*",
  "https://docs.google.com/presentation/*",
];

export type { Theme } from "@mikoto-moocs-sharp/shared";

/**
 * Reactアプリケーション用のコンテナ要素を作成
 */
const createAppContainer = (): HTMLDivElement => {
  const container = document.createElement("div");
  container.id = ROOT_CONTAINER_ID;
  container.style.display = "none";
  return container;
};

/**
 * テーマをDOMに適用
 */
const applyTheme = async () => {
  const theme = await storageManager.getTheme();

  if (theme === "dark") {
    document.body.classList.add("mikoto-dark-theme");
  } else {
    document.body.classList.remove("mikoto-dark-theme");
  }
};

/**
 * テーマ変更を監視
 */
const watchThemeChanges = () => {
  storageManager.watchTheme((newTheme) => {
    if (newTheme === "dark") {
      document.body.classList.add("mikoto-dark-theme");
    } else {
      document.body.classList.remove("mikoto-dark-theme");
    }
  });
};

/**
 * Reactルートをマウント
 */
const mountApp = (container: HTMLDivElement): Root => {
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(createElement(MikotoApp));
  return root;
};

/**
 * クリーンアップ処理を登録
 */
const registerCleanup = (root: Root, container: HTMLDivElement): void => {
  window.addEventListener("beforeunload", () => {
    root.unmount();
    container.remove();
  });
};

export default defineContentScript({
  matches: TARGET_URL_PATTERNS,
  allFrames: true,

  main() {
    applyTheme();
    watchThemeChanges();

    const appContainer = createAppContainer();
    const root = mountApp(appContainer);
    registerCleanup(root, appContainer);
  },
});
