"use client";

import type { RefObject } from "react";
import { useEffect } from "react";

type AccessibleDialogOptions = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef: RefObject<HTMLElement | null>;
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'iframe',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function useAccessibleDialog({
  open,
  onClose,
  triggerRef,
  dialogRef,
  initialFocusRef,
}: AccessibleDialogOptions) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
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
      requestAnimationFrame(() => triggerRef.current?.focus());
    };
  }, [dialogRef, initialFocusRef, onClose, open, triggerRef]);
}
