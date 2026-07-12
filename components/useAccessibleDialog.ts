"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

type AccessibleDialogOptions = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
};

const focusableSelector = [
  'a[href]:not([data-focus-guard])',
  'button:not([disabled]):not([data-focus-guard])',
  'iframe:not([data-focus-guard])',
  'input:not([disabled]):not([data-focus-guard])',
  'select:not([disabled]):not([data-focus-guard])',
  'textarea:not([disabled]):not([data-focus-guard])',
  '[tabindex]:not([tabindex="-1"]):not([data-focus-guard])',
].join(',');

export default function useAccessibleDialog({
  open,
  onClose,
  triggerRef,
  dialogRef,
  initialFocusRef,
}: AccessibleDialogOptions) {
  const restoreFocusFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;

    if (restoreFocusFrameRef.current !== null) {
      cancelAnimationFrame(restoreFocusFrameRef.current);
      restoreFocusFrameRef.current = null;
    }

    const previousOverflow = document.body.style.overflow;
    const triggerElement = triggerRef.current;
    document.body.style.overflow = "hidden";
    initialFocusRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusFrameRef.current = requestAnimationFrame(() => {
        restoreFocusFrameRef.current = null;
        triggerElement?.focus();
      });
    };
  }, [dialogRef, initialFocusRef, onClose, open, triggerRef]);

  useEffect(() => () => {
    if (restoreFocusFrameRef.current !== null) {
      cancelAnimationFrame(restoreFocusFrameRef.current);
    }
  }, []);
}
