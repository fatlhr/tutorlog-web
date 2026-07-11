"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassPlus, X } from "@phosphor-icons/react";

type PublicProofDialogProps = {
  label: string;
  proofId: string;
  triggerContent: ReactNode;
  dialogContent: ReactNode;
};

export default function PublicProofDialog({ label, proofId, triggerContent, dialogContent }: PublicProofDialogProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="tl-proof-trigger"
        data-proof-trigger
        type="button"
        aria-label={`Perbesar ${label}`}
        onClick={() => setOpen(true)}
      >
        {triggerContent}
        <span className="tl-proof-trigger-icon" aria-hidden="true">
          <MagnifyingGlassPlus size={18} weight="bold" />
        </span>
      </button>
      {open ? (
        <div className="tl-proof-dialog-backdrop" role="presentation" onMouseDown={close}>
          <section
            className="tl-proof-dialog"
            data-proof-dialog={proofId}
            role="dialog"
            aria-modal="true"
            aria-label="Perbesar tampilan TutorLog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="tl-proof-dialog-header">
              <p>{label}</p>
              <button ref={closeRef} className="tl-proof-dialog-close" type="button" aria-label="Tutup tampilan" onClick={close}>
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <div className="tl-proof-dialog-media" data-proof-dialog-media={proofId}>
              {dialogContent}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
