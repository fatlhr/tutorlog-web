"use client";

import { useEffect, useRef, useId } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const titleId = useId();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="mob-dialog-scrim" onClick={onClose}>
      <div
        ref={modalRef}
        className="mob-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {title && <h3 id={titleId} style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{title}</h3>}
        {children}
      </div>
    </div>
  );
}
