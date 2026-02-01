export const isTargetElement = (node: Element) =>
  [
    node.tagName.toLowerCase() === "g",
    node.getAttribute("aria-label") !== null,
    node.getAttribute("aria-label") !== "",
  ].every(Boolean);
