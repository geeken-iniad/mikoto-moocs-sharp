import { useEffect } from "react";
import { useSettingsContext } from "../hooks/useSettingsContext";

const SELECTORS = {
  content: "section.content.container-fluid",
  padBlock: "div.pad-block",
  pager: "ul.pager",
};

const POLL_TIMEOUT_MS = 10000;
const POLL_INTERVAL_MS = 100;
const CONTAINER_MIN_WIDTH = 100;
const FLEX_MIN_WIDTH = 50;

const getWidthStorageKey = (padCount: number) =>
  `verticalContainerWidth_${padCount}pads`;
const getFlexStorageKey = (padCount: number) =>
  `verticalFlexRatios_${padCount}pads`;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForLayoutElements = async () => {
  const deadline = performance.now() + POLL_TIMEOUT_MS;

  while (performance.now() < deadline) {
    const content = document.querySelector<HTMLElement>(SELECTORS.content);
    const padBlocks = Array.from(
      document.querySelectorAll<HTMLElement>(SELECTORS.padBlock)
    );
    const pager = document.querySelector<HTMLElement>(SELECTORS.pager);

    if (content && padBlocks.length && pager) {
      return { content, padBlocks, pager };
    }

    await delay(POLL_INTERVAL_MS);
  }

  throw new Error("Timeout waiting for layout elements.");
};

export const LayoutManager = () => {
  const { settings } = useSettingsContext();

  useEffect(() => {
    if (!settings.enableLayoutEnhancements) {
      return;
    }

    let isCleanedUp = false;
    let originalParents: (ParentNode | null)[] = [];
    let originalNextSiblings: (Node | null)[] = [];
    let verticalContainer: HTMLDivElement | null = null;
    let padBlocks: HTMLElement[] = [];

    const init = async () => {
      try {
        const elements = await waitForLayoutElements();
        if (isCleanedUp || !elements) return;

        const { content, pager } = elements;
        padBlocks = elements.padBlocks;

        if (content.querySelector(".vertical")) {
          return;
        }

        originalParents = padBlocks.map((el) => el.parentNode);
        originalNextSiblings = padBlocks.map((el) => el.nextSibling);

        const padCount = padBlocks.length;
        const widthStorageKey = getWidthStorageKey(padCount);
        const flexStorageKey = getFlexStorageKey(padCount);

        verticalContainer = document.createElement("div");
        verticalContainer.className = "vertical";
        const savedWidth = localStorage.getItem(widthStorageKey);
        verticalContainer.style.width = savedWidth || "100%";

        padBlocks.forEach((padBlock) => {
          verticalContainer?.appendChild(padBlock);
        });

        content.append(verticalContainer);
        content.append(pager);

        makeFlexContainerResizable(verticalContainer, flexStorageKey);
        makeContainerResizable(verticalContainer, widthStorageKey);
      } catch (error) {
        console.error("Moocs Sharp: Layout initialization failed.", error);
      }
    };

    init();

    return () => {
      isCleanedUp = true;
      if (verticalContainer) {
        padBlocks.forEach((padBlock: HTMLElement, index: number) => {
          const originalParent = originalParents[index];
          const originalNextSibling = originalNextSiblings[index];
          if (originalParent) {
            originalParent.insertBefore(padBlock, originalNextSibling);
          }
        });
        verticalContainer.remove();
      }
    };
  }, [settings.enableLayoutEnhancements]);

  return null;
};

const makeContainerResizable = (
  container: HTMLElement,
  storageKey: string
) => {
  const handle = document.createElement("div");
  handle.className = "container-resize-handle right";
  container.appendChild(handle);

  handle.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = container.offsetWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX) * 2;
      container.style.width = `${Math.max(CONTAINER_MIN_WIDTH, newWidth)}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      storeWidthAsPercent(container, storageKey);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
};

const makeFlexContainerResizable = (
  container: HTMLElement,
  storageKey: string
) => {
  const padBlocks = Array.from(
    container.children
  ).filter((el) => el.matches("div.pad-block")) as HTMLElement[];
  if (padBlocks.length < 2) return;

  const [leftPane, rightPane] = padBlocks;
  applySavedFlexRatios(leftPane, rightPane, storageKey);

  const divider = document.createElement("div");
  divider.className = "flex-divider";
  leftPane.after(divider);

  divider.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const leftStartWidth = leftPane.offsetWidth;
    const rightStartWidth = rightPane.offsetWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newLeftWidth = leftStartWidth + deltaX;
      const newRightWidth = rightStartWidth - deltaX;

      if (newLeftWidth < FLEX_MIN_WIDTH || newRightWidth < FLEX_MIN_WIDTH) {
        return;
      }

      const totalWidth = newLeftWidth + newRightWidth;
      leftPane.style.flex = `0 1 ${newLeftWidth / totalWidth * 100}%`;
      rightPane.style.flex = `0 1 ${newRightWidth / totalWidth * 100}%`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      storeFlexRatios(leftPane, rightPane, storageKey);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
};

const applySavedFlexRatios = (
  leftPane: HTMLElement,
  rightPane: HTMLElement,
  storageKey: string
) => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    leftPane.style.flex = "1 1 0%";
    rightPane.style.flex = "1 1 0%";
    return;
  }
  const [left, right] = saved.split(":").map(parseFloat);
  if (!isNaN(left) && !isNaN(right)) {
    leftPane.style.flex = `0 1 ${left}%`;
    rightPane.style.flex = `0 1 ${right}%`;
  }
};

const storeFlexRatios = (
  leftPane: HTMLElement,
  rightPane: HTMLElement,
  storageKey: string
) => {
  const totalWidth = leftPane.offsetWidth + rightPane.offsetWidth;
  if (totalWidth === 0) return;
  const leftPercent = (leftPane.offsetWidth / totalWidth) * 100;
  const rightPercent = (rightPane.offsetWidth / totalWidth) * 100;
  localStorage.setItem(
    storageKey,
    `${leftPercent.toFixed(2)}:${rightPercent.toFixed(2)}`
  );
};

const storeWidthAsPercent = (container: HTMLElement, storageKey: string) => {
  const parent = container.parentElement;
  if (!parent) return;
  const parentWidth = parent.clientWidth;
  const widthPx = parseFloat(container.style.width);
  if (!parentWidth || isNaN(widthPx)) return;
  const percent = (widthPx / parentWidth) * 100;
  localStorage.setItem(storageKey, `${percent.toFixed(2)}%`);
};