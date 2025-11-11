/**
 * Injects a style rule for hovering/visible submit buttons and
 * toggles a helper class on `.submit-answer` when its parent
 * `.problem-container` is visible in the viewport.
 *
 * Use by calling `initHoverSubmit()` during your content-script or enhancer init.
 */

const STYLE_ID = "mikoto-hover-submit-style";
const VISIBLE_CLASS = "submit-mikoto-visible";
const CONTAINER_SELECTOR = ".problem-contentpage";
const SUBMIT_SELECTOR = ".submit-answer";

function addVisibleClassToSubmits(container: Element): void {
  const submits = container.querySelectorAll(SUBMIT_SELECTOR);
  submits.forEach((s) => { s.classList.add(VISIBLE_CLASS); });
}

function removeVisibleClassFromSubmits(container: Element): void {
  const submits = container.querySelectorAll(SUBMIT_SELECTOR);
  submits.forEach((s) => { s.classList.remove(VISIBLE_CLASS); });
}

function elementLooksDisplayed(el: Element): boolean {
  const cs = window.getComputedStyle(el as Element);
  if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
  const rect = (el as Element).getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function initHoverSubmit(): void {

  if (typeof document === "undefined") return;

  // Avoid injecting twice
  if (document.getElementById(STYLE_ID)) return;

  const css = `
.panel.pad-form.problem-container .btn.btn-success.submit-answer {
  background-color: #d9534f !important;
  border-color: #d43f3a !important;
  color: #ffffff !important;
}
.submit-answer {
  background-color: #d9534f !important;
}
.${VISIBLE_CLASS} {
  /* marker class — styling can be used elsewhere if needed */
}
`;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.appendChild(document.createTextNode(css));

  const head = document.head || document.getElementsByTagName("head")[0];
  if (head) head.appendChild(style);

  // Use IntersectionObserver to detect visibility in viewport.
  // Fallback: if IntersectionObserver is not available, fall back to checking
  // computed styles on mutation.
  const observed = new WeakSet<Element>();

  let io: IntersectionObserver | null = null;

  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const container = entry.target as Element;
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          addVisibleClassToSubmits(container);
        } else {
          removeVisibleClassFromSubmits(container);
        }
      });
    }, { root: null, threshold: [0, 0.01] });
  }

  function observeContainer(container: Element) {
    if (observed.has(container)) return;
    observed.add(container);
    if (io) {
      io.observe(container);
    }

    // Set initial state synchronously so buttons don't flash incorrectly.
    try {
      if (elementLooksDisplayed(container)) addVisibleClassToSubmits(container);
      else removeVisibleClassFromSubmits(container);
    } catch {
      // ignore
    }
  }

  function unobserveContainer(container: Element) {
    if (!observed.has(container)) return;
    observed.delete(container);
    if (io) {
      io.unobserve(container);
    }
    // Clean up class when container is removed
    removeVisibleClassFromSubmits(container);
  }

  // Observe existing containers
  const existing = Array.from(document.querySelectorAll(CONTAINER_SELECTOR));
  existing.forEach(observeContainer);

  // Watch for container additions/removals
  if (typeof MutationObserver !== "undefined") {
    // relaxed match: for class selectors (e.g. ".foo") treat elements whose
    // className contains the substring as matches. Also treat nodes that are
    // inside a container (ancestor match) as triggers.
    function matchesLoose(el: Element, selector: string): boolean {
      if (!selector) return false;
      if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        const cn = (el.getAttribute('class') || '');
        return cn.indexOf(cls) !== -1;
      }
      try {
        return (el as Element).matches(selector);
      } catch {
        return false;
      }
    }

    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        // log a summary for debugging
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          // if the added node itself matches (loose), observe it
          const loose = matchesLoose(n, CONTAINER_SELECTOR);
          if (loose) observeContainer(n);
          // nodes might contain nested containers
          const nested = Array.from(n.querySelectorAll(CONTAINER_SELECTOR));
          nested.forEach(observeContainer);
          // or the added node might be inside an existing container (ancestor)
          const anc = (n as Element).closest(CONTAINER_SELECTOR);
          if (anc) {
            observeContainer(anc);
          }
        });
        m.removedNodes.forEach((n) => {
          if (!(n instanceof Element)) return;
          const loose = matchesLoose(n, CONTAINER_SELECTOR);
          if (loose) unobserveContainer(n);
          const nested = Array.from(n.querySelectorAll(CONTAINER_SELECTOR));
          nested.forEach(unobserveContainer);
        });
      });
    });

    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }
}

// React wrapper so this feature can be mounted like other enhancers/components
import React from "react";

export const HoverSubmit: React.FC = () => {
  React.useEffect(() => {
    try {
      initHoverSubmit();
    } catch (e) {
      // defensive: don't let this break the React tree
      // eslint-disable-next-line no-console
      console.error("[mikoto] initHoverSubmit failed:", e);
    }
  }, []);

  return null;
};
