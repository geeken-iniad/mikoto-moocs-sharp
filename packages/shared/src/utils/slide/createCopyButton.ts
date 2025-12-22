import { generateElementId } from "./generateElementId";

type CopyButtonHandlers = {
  onCopy: (node: Element, event: MouseEvent) => void;
  onRemove?: (node: Element) => void;
};

const isDarkTheme = () =>
  typeof document !== "undefined" &&
  document.body.classList.contains("mikoto-dark-theme");

const applyCopyButtonStyles = (
  copyButton: HTMLElement,
  rect: DOMRect,
  { isDark, isHover }: { isDark: boolean; isHover: boolean },
) => {
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  copyButton.style.position = "absolute";
  copyButton.style.top = `${top}px`;
  copyButton.style.left = `${left}px`;
  copyButton.style.width = `${rect.width}px`;
  copyButton.style.height = `${rect.height}px`;
  copyButton.style.zIndex = "10000";
  copyButton.style.padding = "0";
  copyButton.style.borderRadius = "6px";
  copyButton.style.cursor = "pointer";
  copyButton.style.transition = "background-color 0.2s, border-color 0.2s";

  if (isDark) {
    copyButton.style.background = isHover
      ? "rgba(74, 123, 200, 0.2)"
      : "rgba(255, 255, 255, 0.08)";
    copyButton.style.border = isHover
      ? "2px dashed #4a7bc8"
      : "2px dashed rgba(74, 123, 200, 0.7)";
  } else {
    copyButton.style.background = isHover
      ? "rgba(52, 113, 235, 0.15)"
      : "rgba(0, 0, 0, 0.12)";
    copyButton.style.border = isHover
      ? "2px dashed #3471eb"
      : "2px dashed rgba(52, 113, 235, 0.6)";
  }
};

const applyDeleteButtonStyles = (
  deleteButton: HTMLButtonElement,
  { isDark, isVisible }: { isDark: boolean; isVisible: boolean },
) => {
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.style.position = "absolute";
  deleteButton.style.top = "-10px";
  deleteButton.style.right = "-10px";
  deleteButton.style.width = "20px";
  deleteButton.style.height = "20px";
  deleteButton.style.borderRadius = "50%";
  deleteButton.style.fontSize = "14px";
  deleteButton.style.lineHeight = "18px";
  deleteButton.style.display = isVisible ? "inline-flex" : "none";
  deleteButton.style.alignItems = "center";
  deleteButton.style.justifyContent = "center";
  deleteButton.style.cursor = "pointer";

  if (isDark) {
    deleteButton.style.background = "#2a2a2a";
    deleteButton.style.color = "#e0e0e0";
    deleteButton.style.border = "1px solid #3a3a3a";
  } else {
    deleteButton.style.background = "#ffffff";
    deleteButton.style.color = "#333333";
    deleteButton.style.border = "1px solid rgba(0, 0, 0, 0.2)";
  }
};

const updateCopyButtonPosition = (copyButton: HTMLElement, rect: DOMRect) => {
  copyButton.style.top = `${rect.top + window.scrollY}px`;
  copyButton.style.left = `${rect.left + window.scrollX}px`;
  copyButton.style.width = `${rect.width}px`;
  copyButton.style.height = `${rect.height}px`;
};

export const createCopyButton = (
  node: Element,
  handlers: CopyButtonHandlers,
) => {
  const rect = node.getBoundingClientRect();
  const id = generateElementId(node);
  const currentCopyButton = document.getElementById(id);

  if (currentCopyButton) {
    const deleteButton = currentCopyButton.querySelector(
      "button",
    ) as HTMLButtonElement | null;
    const isDark = isDarkTheme();
    applyCopyButtonStyles(currentCopyButton, rect, { isDark, isHover: false });
    updateCopyButtonPosition(currentCopyButton, rect);
    if (deleteButton) {
      applyDeleteButtonStyles(deleteButton, { isDark, isVisible: false });
    }
    return currentCopyButton as HTMLButtonElement;
  }

  const deleteButton = document.createElement("button");
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    handlers.onRemove?.(node);
    copyButton.remove();
  });

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.id = id;
  copyButton.addEventListener("click", (event) => {
    handlers.onCopy(node, event);
  });

  const isDark = isDarkTheme();
  applyCopyButtonStyles(copyButton, rect, { isDark, isHover: false });
  applyDeleteButtonStyles(deleteButton, { isDark, isVisible: false });

  copyButton.addEventListener("mouseenter", () => {
    const nextRect = node.getBoundingClientRect();
    const nextIsDark = isDarkTheme();
    applyCopyButtonStyles(copyButton, nextRect, {
      isDark: nextIsDark,
      isHover: true,
    });
    applyDeleteButtonStyles(deleteButton, {
      isDark: nextIsDark,
      isVisible: true,
    });
  });

  copyButton.addEventListener("mouseleave", () => {
    const nextRect = node.getBoundingClientRect();
    const nextIsDark = isDarkTheme();
    applyCopyButtonStyles(copyButton, nextRect, {
      isDark: nextIsDark,
      isHover: false,
    });
    applyDeleteButtonStyles(deleteButton, {
      isDark: nextIsDark,
      isVisible: false,
    });
  });

  document.body.appendChild(copyButton);
  copyButton.appendChild(deleteButton);

  return copyButton;
};
