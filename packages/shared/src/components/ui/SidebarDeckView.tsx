import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface SidebarSection {
  title: string;
  items: {
    text: string;
    href: string;
    icon?: string;
    isActive?: boolean;
  }[];
  isActive?: boolean;
}

interface SidebarDeckViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = {
  container: {
    position: "fixed" as const,
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
    zIndex: 4,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
    color: "#333",
  },
  hint: {
    fontSize: "12px",
    color: "#999",
    marginLeft: "10px",
    fontWeight: 400,
  },
  columnsContainer: {
    display: "flex",
    overflow: "auto",
    flex: 1,
    padding: "20px",
    gap: "20px",
  },
  column: {
    minWidth: "300px",
    maxWidth: "400px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column" as const,
    maxHeight: "100%",
    overflow: "hidden",
  },
  columnHeader: {
    padding: "20px 20px 0 20px",
    flexShrink: 0,
  },
  columnTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    fontWeight: 600,
    color: "#333",
    paddingBottom: "10px",
    borderBottom: "2px solid #426dc2",
  },
  columnContent: {
    flex: 1,
    overflow: "auto",
    padding: "0 20px 20px 20px",
  },
  itemsList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  item: {
    margin: 0,
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 15px",
    backgroundColor: "#fff",
    border: "1.5px solid #426dc2",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#333",
    transition: "all 0.2s ease",
    fontSize: "14px",
  },
  icon: {
    minWidth: "20px",
    textAlign: "center" as const,
  },
};

export const SidebarDeckView: React.FC<SidebarDeckViewProps> = ({
  isOpen,
  onClose,
}) => {
  const [sections, setSections] = useState<SidebarSection[]>([]);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [dimensions, setDimensions] = useState({ headerHeight: 50, sidebarWidth: 50 });
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ヘッダーとサイドバーの実際のサイズを計算
    const calculateDimensions = () => {
      const header = document.querySelector(".main-header");
      const sidebar = document.querySelector(".main-sidebar");

      const headerHeight = header?.getBoundingClientRect().height || 50;
      const sidebarWidth = sidebar?.getBoundingClientRect().width || 50;

      setDimensions({ headerHeight, sidebarWidth });

      // CSS変数も更新して他の要素でも使えるようにする
      document.body.style.setProperty("--mikoto-header-height", `${headerHeight}px`);
      document.body.style.setProperty("--mikoto-sidebar-width", `${sidebarWidth}px`);
    };

    calculateDimensions();

    // ウィンドウリサイズ時に再計算
    window.addEventListener("resize", calculateDimensions);
    return () => window.removeEventListener("resize", calculateDimensions);
  }, []);

  useEffect(() => {
    // ダークテーマの検出
    const checkDarkTheme = () => {
      setIsDarkTheme(document.body.classList.contains("mikoto-dark-theme"));
    };

    checkDarkTheme();

    // テーマ変更の監視
    const observer = new MutationObserver(checkDarkTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // スクロールバーのスタイルを動的に追加
    const styleId = "mikoto-deck-scrollbar-style";
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const scrollbarStyles = isDarkTheme
      ? `
        .mikoto-deck-column-content::-webkit-scrollbar {
          width: 12px;
        }
        .mikoto-deck-column-content::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 6px;
        }
        .mikoto-deck-column-content::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 6px;
        }
        .mikoto-deck-column-content::-webkit-scrollbar-thumb:hover {
          background: #5a5a5a;
        }
      `
      : `
        .mikoto-deck-column-content::-webkit-scrollbar {
          width: 12px;
        }
        .mikoto-deck-column-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 6px;
        }
        .mikoto-deck-column-content::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 6px;
        }
        .mikoto-deck-column-content::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `;

    styleElement.textContent = scrollbarStyles;

    return () => {
      styleElement?.remove();
    };
  }, [isDarkTheme]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    // ダイアログが開いた時にフォーカスを移動
    if (isOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // デックが開いている時は背景のスクロールを無効化
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // サイドバーのHTMLから構造を読み取る
    const parseSidebarStructure = (): SidebarSection[] => {
      const sidebar = document.querySelector(".sidebar-menu");
      if (!sidebar) return [];

      const sections: SidebarSection[] = [];

      sidebar.childNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const element = node as HTMLElement;

        // ヘッダー要素はスキップ（treeviewのみを列として扱う）
        if (element.classList.contains("header")) {
          return;
        }

        // treeview要素の場合、独立した列として扱う
        if (
          element.tagName === "LI" &&
          element.classList.contains("treeview")
        ) {
          const link = element.querySelector("a");
          if (!link) return;

          const textElement = link.querySelector(".sidebar-menu-text");
          const iconElement = link.querySelector("i");
          const text = textElement?.textContent?.trim() || "";
          const icon = iconElement?.className || "";

          // treeview自体がactiveかチェック
          const isTreeviewActive = element.classList.contains("active");

          // treeviewのタイトルを列のタイトルとする
          const section: SidebarSection = {
            title: text,
            items: [],
            isActive: isTreeviewActive,
          };

          // treeview-menuの子要素をアイテムとして追加
          const submenu = element.querySelector(".treeview-menu");
          if (submenu) {
            submenu.querySelectorAll("li").forEach((subItem) => {
              const subLink = subItem.querySelector("a");
              if (!subLink) return;

              const subText =
                subLink
                  .querySelector(".sidebar-menu-text")
                  ?.textContent?.trim() ||
                subLink.textContent?.trim() ||
                "";
              const subHref = subLink.getAttribute("href") || "";
              const subIconElement = subLink.querySelector("i");
              const subIcon = subIconElement?.className || icon;
              const isItemActive = subItem.classList.contains("active");

              if (subText && subHref) {
                section.items.push({
                  text: subText,
                  href: subHref,
                  icon: subIcon,
                  isActive: isItemActive,
                });
              }
            });
          }

          // アイテムがある場合のみセクションを追加
          if (section.items.length > 0) {
            sections.push(section);
          }
        }
      });

      return sections;
    };

    setSections(parseSidebarStructure());
  }, [isOpen]);

  if (!isOpen) return null;

  // ダークテーマ用のスタイル
  const themedStyles = {
    container: {
      ...styles.container,
      backgroundColor: isDarkTheme ? "#1a1a1a" : "#fff",
      top: `${dimensions.headerHeight}px`,
      left: `${dimensions.sidebarWidth}px`,
    },
    header: {
      ...styles.header,
      backgroundColor: isDarkTheme ? "#1a1a1a" : "#f8f9fa",
      borderBottom: isDarkTheme ? "2px solid #3a3a3a" : "2px solid #e0e0e0",
    },
    title: {
      ...styles.title,
      color: isDarkTheme ? "#e0e0e0" : "#333",
    },
    hint: {
      ...styles.hint,
      color: isDarkTheme ? "#888" : "#999",
    },
    column: {
      ...styles.column,
      backgroundColor: isDarkTheme ? "#2a2a2a" : "#f8f9fa",
    },
    columnHeader: {
      ...styles.columnHeader,
      backgroundColor: isDarkTheme ? "#2a2a2a" : "#f8f9fa",
    },
    columnTitle: {
      ...styles.columnTitle,
      color: isDarkTheme ? "#e0e0e0" : "#333",
      borderBottom: isDarkTheme ? "2px solid #4a7bc8" : "2px solid #426dc2",
    },
    columnContent: {
      ...styles.columnContent,
    },
    link: {
      ...styles.link,
      backgroundColor: isDarkTheme ? "#2a2a2a" : "#fff",
      borderColor: isDarkTheme ? "#4a7bc8" : "#426dc2",
      color: isDarkTheme ? "#e0e0e0" : "#333",
    },
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: isDarkTheme ? "#e0e0e0" : "#666",
    padding: "5px 10px",
    transition: "color 0.2s",
  };

  const hoverColor = isDarkTheme ? "#e0e0e0" : "#333";
  const normalColor = isDarkTheme ? "#a0a0a0" : "#666";
  const linkHoverBg = isDarkTheme ? "#333333" : "#f0f0f0";
  const linkNormalBg = isDarkTheme ? "#2a2a2a" : "#fff";

  const deckContent = (
    <div
      id="mikoto-deck-view"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mikoto-deck-view-title"
      tabIndex={-1}
      style={themedStyles.container}
    >
      <div style={themedStyles.header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2 id="mikoto-deck-view-title" style={themedStyles.title}>
            目次デックビュー
          </h2>
          <div style={themedStyles.hint}>(Escキーで閉じる)</div>
        </div>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = normalColor;
          }}
          aria-label="閉じる"
        >
          <i className="fa fa-times" />
        </button>
      </div>
      <div style={styles.columnsContainer}>
        {sections.map((section, index) => {
          // アクティブな列のスタイル
          const activeColumnStyle = section.isActive
            ? {
                ...themedStyles.column,
                backgroundColor: isDarkTheme ? "#3a3a3a" : "#e8f0fe",
                boxShadow: isDarkTheme
                  ? "0 0 0 2px #4a7bc8"
                  : "0 0 0 2px #426dc2",
              }
            : themedStyles.column;

          const activeColumnTitleStyle = section.isActive
            ? {
                ...themedStyles.columnTitle,
                borderBottom: isDarkTheme
                  ? "3px solid #5a8bd8"
                  : "3px solid #4a7bc8",
                fontWeight: 700,
              }
            : themedStyles.columnTitle;

          return (
            <div key={index} style={activeColumnStyle}>
              <div style={themedStyles.columnHeader}>
                <h3 style={activeColumnTitleStyle}>{section.title}</h3>
              </div>
              <div
                style={themedStyles.columnContent}
                className="mikoto-deck-column-content"
              >
                <ul style={styles.itemsList}>
                  {section.items.map((item, itemIndex) => {
                    // アクティブなアイテムのスタイル
                    const activeItemStyle = item.isActive
                      ? {
                          ...themedStyles.link,
                          backgroundColor: isDarkTheme ? "#4a7bc8" : "#426dc2",
                          color: "#fff",
                          fontWeight: 600,
                          boxShadow: isDarkTheme
                            ? "0 2px 8px rgba(74, 123, 200, 0.4)"
                            : "0 2px 8px rgba(66, 109, 194, 0.4)",
                        }
                      : themedStyles.link;

                    return (
                      <li key={itemIndex} style={styles.item}>
                        <a
                          href={item.isActive ? "#" : item.href}
                          style={activeItemStyle}
                          onClick={(e) => {
                            if (item.isActive) {
                              e.preventDefault();
                            }
                          }}
                          onMouseEnter={(e) => {
                            if (!item.isActive) {
                              e.currentTarget.style.backgroundColor =
                                linkHoverBg;
                            }
                            e.currentTarget.style.transform = "translateX(5px)";
                          }}
                          onMouseLeave={(e) => {
                            if (!item.isActive) {
                              e.currentTarget.style.backgroundColor =
                                linkNormalBg;
                            } else {
                              e.currentTarget.style.backgroundColor =
                                isDarkTheme ? "#4a7bc8" : "#426dc2";
                            }
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          {item.icon && (
                            <i className={item.icon} style={styles.icon} />
                          )}
                          <span>{item.text}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return createPortal(deckContent, document.body);
};
