import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSlideElementObserver, useSlideEnhancerSetting } from "../../hooks";
import { createCopyButton, generateElementId } from "../../utils/slide";
import { SlideTextEditor } from "../ui";

const isGoogleSlides = () =>
  typeof window !== "undefined" &&
  window.location.hostname === "docs.google.com" &&
  window.location.pathname.startsWith("/presentation");

const copyTextWithExecCommand = (text: string) => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";

  document.body.appendChild(textarea);
  textarea.select();

  const success = document.execCommand("copy");

  textarea.remove();
  return success;
};

export const SlideEnhancer = () => {
  const { enabled: featureEnabled } = useSlideEnhancerSetting();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const buttonMapRef = useRef<Map<Element, HTMLButtonElement>>(new Map());

  const enabled = useMemo(
    () => isGoogleSlides() && featureEnabled,
    [featureEnabled],
  );

  const handleCopy = useCallback((element: Element, event: MouseEvent) => {
    const text = element.getAttribute("aria-label") ?? "";
    if (!text) return;

    const success = copyTextWithExecCommand(text);
    if (success && !event.shiftKey) {
      setCopiedText(text);
    }
  }, []);

  const handleCopyWithEditor = useCallback((text: string) => {
    copyTextWithExecCommand(text);
  }, []);

  const handleRemove = useCallback((element: Element) => {
    const button = buttonMapRef.current.get(element);
    if (button) {
      button.remove();
      buttonMapRef.current.delete(element);
    }
  }, []);

  const slideObserverHandlers = useMemo(
    () => ({
      onElementFound: (element: Element) => {
        if (!enabled) return;
        const button = createCopyButton(element, {
          onCopy: handleCopy,
          onRemove: handleRemove,
        });
        buttonMapRef.current.set(element, button as HTMLButtonElement);
      },
      onElementRemoved: (element: Element) => {
        const button = buttonMapRef.current.get(element);
        if (button) {
          button.remove();
          buttonMapRef.current.delete(element);
        } else {
          const id = generateElementId(element);
          const existing = document.getElementById(id);
          existing?.remove();
        }
      },
    }),
    [enabled, handleCopy, handleRemove],
  );

  useSlideElementObserver(slideObserverHandlers);

  useEffect(() => {
    if (enabled) return;
    setCopiedText(null);
    buttonMapRef.current.forEach((button) => {
      button.remove();
    });
    buttonMapRef.current.clear();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    return () => {
      buttonMapRef.current.forEach((button) => {
        button.remove();
      });
      buttonMapRef.current.clear();
    };
  }, [enabled]);

  if (!enabled) return null;

  if (!copiedText) return null;

  return (
    <SlideTextEditor
      text={copiedText}
      onCopy={handleCopyWithEditor}
      onClose={() => setCopiedText(null)}
    />
  );
};
