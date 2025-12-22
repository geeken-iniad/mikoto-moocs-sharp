import { parseInlineStyle } from "./parseInlineStyle";

const isOpacityZero = (value: string | undefined) => {
  if (!value) return false;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed === 0;
};

export const isElementVisible = (node: Element) => {
  if (node.getAttribute("aria-hidden") === "true") return false;

  const styles = parseInlineStyle(node.getAttribute("style") ?? "");
  return !isOpacityZero(styles.opacity);
};
