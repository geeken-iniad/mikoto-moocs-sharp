import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";

import { MikotoApp } from "./components";
import "./style.css";

const ROOT_CONTAINER_ID = "mikoto-react-root";
const TARGET_URL_PATTERNS = [
  "https://moocs.iniad.org/*",
  "https://docs.google.com/presentation/*",
];

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
    const appContainer = createAppContainer();
    const root = mountApp(appContainer);
    registerCleanup(root, appContainer);
  },
});
