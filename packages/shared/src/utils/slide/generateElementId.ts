export const generateElementId = (node: Element) => {
  const ariaLabel = node.getAttribute("aria-label") ?? "";
  const elementId = node.getAttribute("id") ?? "";
  return `mikoto-slide-copy-${ariaLabel}-${elementId}`;
};
