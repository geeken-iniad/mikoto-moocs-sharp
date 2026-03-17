import contentStyle from "@mikoto-moocs-sharp/shared/styles/content.scss?style";

let injected = false;

/**
 * Ensure Mikoto base styles are available on the page.
 */
export function ensureContentStyleInjected() {
  if (injected) {
    return;
  }

  const nextStyle = contentStyle.cloneNode(true) as HTMLStyleElement;
  nextStyle.setAttribute("data-mikoto-styles", "true");

  const previousStyle = document.head.querySelector<HTMLStyleElement>(
    'style[data-mikoto-styles="true"]',
  );

  if (previousStyle) {
    previousStyle.replaceWith(nextStyle);
  } else {
    document.head.append(nextStyle);
  }

  injected = true;
}
