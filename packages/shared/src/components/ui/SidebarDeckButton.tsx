import React, { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { useElementObserver } from "../../hooks";
import { SidebarDeckView } from "./SidebarDeckView";

export const SidebarDeckButton: React.FC = () => {
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [buttonContainer, setButtonContainer] = useState<HTMLElement | null>(
    null,
  );

  const handleSidebar = useCallback((elements: NodeListOf<Element>) => {
    const sidebar = elements[0];
    if (!sidebar) return;

    // 既にボタンコンテナが存在するかチェック
    let container = sidebar.querySelector(
      ".mikoto-deck-button-container",
    ) as HTMLElement;

    if (!container) {
      // 新しいコンテナを作成
      container = document.createElement("li");
      container.className = "mikoto-deck-button-container";

      // サイドバーメニューの先頭に追加
      const firstChild = sidebar.firstChild;
      if (firstChild) {
        sidebar.insertBefore(container, firstChild);
      } else {
        sidebar.appendChild(container);
      }
    }

    setButtonContainer(container);
  }, []);

  useElementObserver(".sidebar-menu", handleSidebar);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeckOpen(!isDeckOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      setIsDeckOpen(!isDeckOpen);
    }
  };

  const handleClose = () => {
    setIsDeckOpen(false);
  };

  return (
    <>
      {buttonContainer &&
        createPortal(
          <>
            <a
              href="#"
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              role="button"
              aria-expanded={isDeckOpen}
              aria-controls="mikoto-deck-view"
            >
              <i className="fa fa-th"></i>
              <span>
                {" "}
                <span className="sidebar-menu-text">
                  デックビュー (クリックで開閉)
                </span>
              </span>
              <span className="pull-right-container">
                <i className="fa fa-angle-left pull-right"></i>
              </span>
            </a>
          </>,
          buttonContainer,
        )}
      <SidebarDeckView isOpen={isDeckOpen} onClose={handleClose} />
    </>
  );
};
