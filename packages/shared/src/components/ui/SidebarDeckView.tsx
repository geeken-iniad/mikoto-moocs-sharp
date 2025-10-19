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
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  container: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    width: "100%",
    height: "100%",
    maxWidth: "100%",
    maxHeight: "100%",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#f8f9fa",
  },
  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 600,
    color: "#333",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    padding: "5px 10px",
    transition: "color 0.2s",
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
    padding: "20px",
    display: "flex",
    flexDirection: "column" as const,
  },
  columnTitle: {
    margin: "0 0 15px 0",
    fontSize: "18px",
    fontWeight: 600,
    color: "#333",
    paddingBottom: "10px",
    borderBottom: "2px solid #426dc2",
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
                  subLink.querySelector(".sidebar-menu-text")?.textContent?.trim() ||
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const deckContent = (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.container} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>目次デックビュー</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#666";
            }}
          >
            <i className="fa fa-times" />
          </button>
        </div>
        <div style={styles.columnsContainer}>
          {sections.map((section, index) => (
            <div key={index} style={styles.column}>
              <h3 style={styles.columnTitle}>{section.title}</h3>
              <ul style={styles.itemsList}>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={styles.item}>
                    <a
                      href={item.href}
                      style={styles.link}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                        e.currentTarget.style.transform = "translateX(5px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
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
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(deckContent, document.body);
};
