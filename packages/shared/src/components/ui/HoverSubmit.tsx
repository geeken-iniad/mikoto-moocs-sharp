/**
 * Injects a style rule for hovering/visible submit buttons and
 * toggles a helper class on `.submit-answer` when its parent
 * `.problem-container` is visible in the viewport.
 *
 * Use by calling `initHoverSubmit()` during your content-script or enhancer init.
 */

const STYLE_ID = "mikoto-hover-submit-style";
const VISIBLE_CLASS = "submit-mikoto-visible";
const INVISIBLE_CLASS = "submit-mikoto-button-invisible";
const CONTAINER_SELECTOR = ".problem-contentpage";
const SUBMIT_SELECTOR = ".submit-answer";

function addVisibleClassToSubmits(container: Element): void {
  const submits = container.querySelectorAll(SUBMIT_SELECTOR);
  submits.forEach((s) => {
    s.classList.add(VISIBLE_CLASS);
    // ensure invisible class state is computed/observed when visible marker applied
    try {
  // watcher may be installed later; for now compute display (ignore floating class)
  if (!elementLooksDisplayedIgnoringFloating(s)) s.classList.add(INVISIBLE_CLASS);
  else s.classList.remove(INVISIBLE_CLASS);
    } catch {
      // ignore
    }
  });
}

function removeVisibleClassFromSubmits(container: Element): void {
  const submits = container.querySelectorAll(SUBMIT_SELECTOR);
  submits.forEach((s) => {
    s.classList.remove(VISIBLE_CLASS);
    // when no longer marked visible, also remove the invisible marker
    s.classList.remove(INVISIBLE_CLASS);
  });
}

function elementLooksDisplayed(el: Element): boolean {
  const cs = window.getComputedStyle(el as Element);
  if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
  const rect = (el as Element).getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Compute "looks displayed" while temporarily ignoring the floating helper
// class so callers can decide whether to float the element without the
// floating class interfering with the measurement.
function elementLooksDisplayedIgnoringFloating(el: Element): boolean {
  try {
    const had = el.classList.contains(INVISIBLE_CLASS);
    if (had) el.classList.remove(INVISIBLE_CLASS);
    const looks = elementLooksDisplayed(el);
    if (had) el.classList.add(INVISIBLE_CLASS);
    return looks;
  } catch {
    return false;
  }
}

export function initHoverSubmit(): void {

  if (typeof document === "undefined") return;

  // Avoid injecting twice
  if (document.getElementById(STYLE_ID)) return;

  const css = `
.submit-mikoto-visible {
  background-color: #d9534f !important;
  /*  Highlight submit buttons when their container is visible */
}
.${VISIBLE_CLASS} {
  /* marker class — styling can be used elsewhere if needed */
}

/* When a visible submit is computed to be offscreen, add this helper
   class and float the button so the user can still access it. */
.${INVISIBLE_CLASS} {
  position: fixed !important;
  bottom: 12px !important;
  z-index: 2147483647 !important;
  display: inline-block !important;
  opacity: 0.98 !important;
  pointer-events: auto !important;
  transition: transform 160ms ease, opacity 160ms ease;
  transform: translateY(0) !important;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  border-radius: 6px;
}
.${VISIBLE_CLASS}.${INVISIBLE_CLASS} {
  /* When both marker and helper are present, keep visual consistency. */
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
    // Track known submit elements so we can re-evaluate their on-screen state
    // with a simple check. Use Set so we can iterate when handling scroll/resize.
    const observedSubmit = new Set<Element>();

  // Ensure submit elements inside a container are tracked and
  // have their invisible state computed immediately.
  function ensureObservedSubmits(container: Element) {
    try {
      const submits = Array.from(container.querySelectorAll(SUBMIT_SELECTOR));
      submits.forEach((s) => {
        // track for later re-evaluation and compute initial state
        observedSubmit.add(s);
        try {
          if (!elementLooksDisplayedIgnoringFloating(s) && s.classList.contains(VISIBLE_CLASS)) s.classList.add(INVISIBLE_CLASS);
          else s.classList.remove(INVISIBLE_CLASS);
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }
  }

  let io: IntersectionObserver | null = null;

  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const container = entry.target as Element;
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
          // Ensure submit buttons are observed and their state computed
          ensureObservedSubmits(container);
          addVisibleClassToSubmits(container);
        } else {
          removeVisibleClassFromSubmits(container);
        }
      });
    }, { root: null, threshold: [0, 0.01] });
  }

    // No per-button IntersectionObserver here — we'll use a simple check
    // that tests whether the element is displayed and intersects the viewport.

    function isElementActuallyVisible(el: Element): boolean {
      try {
        if (!elementLooksDisplayed(el)) return false;
        const rect = el.getBoundingClientRect();
        const vw = (window.innerWidth || document.documentElement.clientWidth);
        const vh = (window.innerHeight || document.documentElement.clientHeight);
        return rect.bottom > 0 && rect.top < vh && rect.right > 0 && rect.left < vw;
      } catch {
        return false;
      }
    }

    function checkSubmitVisibility(el: Element) {
      try {
            // Measure the element's natural/original visibility while ignoring
            // the floating helper class; otherwise applying the floating class
            // makes the element 'visible' and we immediately remove the class,
            // causing a flicker loop.
            if (isElementActuallyVisibleIgnoringFloating(el)) el.classList.remove(INVISIBLE_CLASS);
            else if (el.classList.contains(VISIBLE_CLASS)) el.classList.add(INVISIBLE_CLASS);
      } catch {
        // ignore
      }
    }

        // Measure visibility while temporarily removing the floating helper
        // class so the check reflects the element's original position.
        function isElementActuallyVisibleIgnoringFloating(el: Element): boolean {
          try {
            const had = el.classList.contains(INVISIBLE_CLASS);
            if (had) el.classList.remove(INVISIBLE_CLASS);
            const visible = isElementActuallyVisible(el);
            if (had) el.classList.add(INVISIBLE_CLASS);
            return visible;
          } catch {
            return false;
          }
        }

        

    // Debounced re-evaluation triggered on scroll/resize/orientationchange
    let scheduledReeval = false;
    function scheduleReevaluate() {
      if (scheduledReeval) return;
      scheduledReeval = true;
      requestAnimationFrame(() => {
        scheduledReeval = false;
        observedSubmit.forEach((el) => { checkSubmitVisibility(el); });
      });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', scheduleReevaluate, { passive: true });
      window.addEventListener('resize', scheduleReevaluate, { passive: true });
      window.addEventListener('orientationchange', scheduleReevaluate, { passive: true });
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

    // Observe submit elements inside this container so we can toggle the
    // invisible helper class when an individual button scrolls out of view.
    function watchSubmit(el: Element) {
      if (observedSubmit.has(el)) return;
      observedSubmit.add(el);
      // initial state
      try {
        if (!elementLooksDisplayedIgnoringFloating(el) && el.classList.contains(VISIBLE_CLASS)) el.classList.add(INVISIBLE_CLASS);
        else el.classList.remove(INVISIBLE_CLASS);
      } catch {
        // ignore
      }
    }

    function unwatchSubmit(el: Element) {
      if (!observedSubmit.has(el)) return;
      observedSubmit.delete(el);
      el.classList.remove(INVISIBLE_CLASS);
    }

    // watch current submits
    const currentSubmits = Array.from(container.querySelectorAll(SUBMIT_SELECTOR));
    currentSubmits.forEach(watchSubmit);

    // track dynamic submit additions/removals within this container
    if (typeof MutationObserver !== "undefined") {
      const innerMo = new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          m.addedNodes.forEach((n) => {
            if (!(n instanceof Element)) return;
            if ((n as Element).matches?.(SUBMIT_SELECTOR)) watchSubmit(n as Element);
            const nested = Array.from((n as Element).querySelectorAll ? (n as Element).querySelectorAll(SUBMIT_SELECTOR) : []);
            nested.forEach(watchSubmit);
          });
          m.removedNodes.forEach((n) => {
            if (!(n instanceof Element)) return;
            if ((n as Element).matches?.(SUBMIT_SELECTOR)) unwatchSubmit(n as Element);
            const nested = Array.from((n as Element).querySelectorAll ? (n as Element).querySelectorAll(SUBMIT_SELECTOR) : []);
            nested.forEach(unwatchSubmit);
          });
        });
      });
      innerMo.observe(container, { childList: true, subtree: true });

      // store a reference so we can disconnect on unobserveContainer
      // attach to the DOM element via a property with a narrow type
      try {
        const elWithProp = container as Element & { __mikoto_inner_mo?: MutationObserver };
        elWithProp.__mikoto_inner_mo = innerMo;
      } catch {
        // ignore
      }
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
    // disconnect any inner mutation observer
    try {
      const elWithProp = container as Element & { __mikoto_inner_mo?: MutationObserver };
      const innerMo = elWithProp.__mikoto_inner_mo;
      if (innerMo && typeof innerMo.disconnect === 'function') innerMo.disconnect();
      delete elWithProp.__mikoto_inner_mo;
    } catch {
      // ignore
    }
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
      console.error("[mikoto] initHoverSubmit failed:", e);
    }
  }, []);

  return null;
};
