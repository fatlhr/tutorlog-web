"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";

type FocusReference = RefObject<HTMLElement | null>;

export interface DialogBehaviorOptions {
  open: boolean;
  onClose: () => void;
  dismissible?: boolean;
  panelRef: FocusReference;
  initialFocusRef?: FocusReference;
  returnFocusRef?: FocusReference;
}

export const DialogNestingContext = createContext(false);

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
const focusableSelector = [
  "a[href]:not([data-focus-guard])",
  "button:not([disabled]):not([data-focus-guard])",
  "iframe:not([data-focus-guard])",
  "input:not([disabled]):not([data-focus-guard])",
  "select:not([disabled]):not([data-focus-guard])",
  "textarea:not([disabled]):not([data-focus-guard])",
  "[tabindex]:not([tabindex='-1']):not([data-focus-guard])",
].join(",");

let scrollbarWidthCache: number | null = null;

function ensureScrollbarWidth() {
  if (scrollbarWidthCache === null) {
    if (typeof window === "undefined") return 0;
    scrollbarWidthCache = window.innerWidth - document.documentElement.clientWidth;
  }
  return scrollbarWidthCache;
}

export function useDialogBehavior({
  open,
  onClose,
  dismissible = true,
  panelRef,
  initialFocusRef,
  returnFocusRef,
}: DialogBehaviorOptions) {
  const nested = useContext(DialogNestingContext);
  const onCloseRef = useRef(onClose);
  const restoreFocusFrameRef = useRef<number | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  if (open && nested) {
    throw new Error("TutorLog dialogs cannot be nested.");
  }

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    if (restoreFocusFrameRef.current !== null) {
      cancelAnimationFrame(restoreFocusFrameRef.current);
      restoreFocusFrameRef.current = null;
    }

    const previousActive = document.activeElement as HTMLElement | null;
    const scrollbarWidth = ensureScrollbarWidth();

    if (scrollbarWidth > 0) {
      document.documentElement.style.setProperty(
        "--scrollbar-compensation",
        `${scrollbarWidth}px`,
      );
    }
    document.documentElement.classList.add("bodyScrollLock");

    const focusable = () => Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    ).filter((element) => element.getClientRects().length > 0);
    const firstTarget = initialFocusRef?.current ?? focusable()[0] ?? panelRef.current;
    firstTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const targets = focusable();
      if (targets.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.classList.remove("bodyScrollLock");
      document.documentElement.style.removeProperty("--scrollbar-compensation");
      const returnTarget = returnFocusRef?.current ?? previousActive;
      restoreFocusFrameRef.current = requestAnimationFrame(() => {
        restoreFocusFrameRef.current = null;
        returnTarget?.focus();
      });
    };
  }, [dismissible, initialFocusRef, open, panelRef, returnFocusRef]);

  useEffect(() => () => {
    if (restoreFocusFrameRef.current !== null) {
      cancelAnimationFrame(restoreFocusFrameRef.current);
    }
  }, []);
}
