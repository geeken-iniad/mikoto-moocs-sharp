import { generateElementId } from "./generateElementId";

type CopyButtonHandlers = {
  onCopy: (node: Element, event: MouseEvent) => void;
  onRemove?: (node: Element) => void;
};

const updateCopyButtonPosition = (
  copyButton: HTMLElement,
  rect: DOMRect,
) => {
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  copyButton.style.top = `${top}px`;
  copyButton.style.left = `${left}px`;
  copyButton.style.width = `${rect.width}px`;
  copyButton.style.height = `${rect.height}px`;
};

export const createCopyButton = (node: Element, handlers: CopyButtonHandlers) => {
  const rect = node.getBoundingClientRect();
  const id = generateElementId(node);
  const currentCopyButton = document.getElementById(id);

  if (currentCopyButton) {
    updateCopyButtonPosition(currentCopyButton, rect);
    return currentCopyButton as HTMLButtonElement;
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "×";
  deleteButton.classList.add("mikoto-slide-delete-button");
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    handlers.onRemove?.(node);
    copyButton.remove();
  });

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.id = id;
  copyButton.classList.add("mikoto-slide-copy-button");
  copyButton.addEventListener("click", (event) => {
    handlers.onCopy(node, event);
  });

  updateCopyButtonPosition(copyButton, rect);

  document.body.appendChild(copyButton);
  copyButton.appendChild(deleteButton);

  return copyButton;
};
