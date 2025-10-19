import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SidebarSection {
  title: string;
  items: {
    text: string;
    href: string;
    icon?: string;
  }[];
}

interface SidebarDeckViewProps {
  isOpen: boolean;
  onClose: () => void;
}

const styles = {
  container: {
    position: "fixed" as const,
    top: "50px",
    left: "50px",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.1)",
    zIndex: 9999,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 20px",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 600,
    color: "#333",
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
    if (!isOpen) return;

    // サイドバーのHTMLから構造を読み取る
    const parseSidebarStructure = (): SidebarSection[] => {
      const sidebar = document.querySelector(".sidebar-menu");
      if (!sidebar) return [];

      const sections: SidebarSection[] = [];
      let currentSection: SidebarSection | null = null;

      sidebar.childNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const element = node as HTMLElement;

        // ヘッダー要素の場合
        if (element.classList.contains("header")) {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = {
            title: element.textContent?.trim() || "",
            items: [],
          };
        }
        // 通常のリンク項目の場合
        else if (element.tagName === "LI" && currentSection) {
          const link = element.querySelector("a");
          if (!link) return;

          const textElement = link.querySelector(".sidebar-menu-text");
          const iconElement = link.querySelector("i");
          const href = link.getAttribute("href") || "";
          const text = textElement?.textContent?.trim() || "";
          const icon = iconElement?.className || "";

          // treeview の場合は子要素も取得
          if (element.classList.contains("treeview")) {
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

                if (subText && subHref) {
                  currentSection?.items.push({
                    text: `${text} > ${subText}`,
                    href: subHref,
                    icon,
                  });
                }
              });
            }
          } else if (text && href) {
            currentSection.items.push({ text, href, icon });
          }
        }
      });

      if (currentSection) {
        sections.push(currentSection);
      }

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
    <div style={themedStyles.container}>
      <div style={themedStyles.header}>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = normalColor;
          }}
        >
          <i className="fa fa-times" />
        </button>
        <h2 style={themedStyles.title}>目次デックビュー</h2>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = normalColor;
          }}
        >
          <i className="fa fa-times" />
        </button>
      </div>
      <div style={styles.columnsContainer}>
        {sections.map((section, index) => (
          <div key={index} style={themedStyles.column}>
            <div style={themedStyles.columnHeader}>
              <h3 style={themedStyles.columnTitle}>{section.title}</h3>
            </div>
            <div
              style={themedStyles.columnContent}
              className="mikoto-deck-column-content"
            >
              <ul style={styles.itemsList}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={styles.item}>
                    <a
                      href={item.href}
                      style={themedStyles.link}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = linkHoverBg;
                        e.currentTarget.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = linkNormalBg;
                        e.currentTarget.style.transform = "translateX(0)";
                      }}
                    >
                      {item.icon && (
                        <i className={item.icon} style={styles.icon} />
                      )}
                      <span>{item.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(deckContent, document.body);
};
