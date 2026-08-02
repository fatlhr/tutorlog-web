"use client";

import type { ReactNode } from "react";
import { useCallback, useRef, useState } from "react";
import { MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import { PublicIconButton } from "@/components/public-ui/public-icon-button";
import {
  DialogNestingContext,
  useDialogBehavior,
} from "@/components/ui/use-dialog-behavior";

type PublicProofDialogProps = {
  label: string;
  proofId: string;
  triggerContent: ReactNode;
  dialogContent: ReactNode;
};

export default function PublicProofDialog({ label, proofId, triggerContent, dialogContent }: PublicProofDialogProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDialogBehavior({
    open,
    onClose: close,
    panelRef: dialogRef,
    initialFocusRef: closeRef,
    returnFocusRef: triggerRef,
  });

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
        <DialogNestingContext.Provider value>
          <div className="tl-proof-dialog-backdrop" role="presentation" onMouseDown={close}>
            <section
              ref={dialogRef}
              className="tl-proof-dialog"
              data-proof-dialog={proofId}
              role="dialog"
              aria-modal="true"
              aria-label="Perbesar tampilan TutorLog"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="tl-proof-dialog-header">
                <p>{label}</p>
                <PublicIconButton
                  buttonRef={closeRef}
                  icon={<X size={20} weight="bold" />}
                  label="Tutup tampilan"
                  size="proof"
                  onClick={close}
                />
              </div>
              <div className="tl-proof-dialog-media" data-proof-dialog-media={proofId}>
                {dialogContent}
              </div>
            </section>
          </div>
        </DialogNestingContext.Provider>
      ) : null}
    </>
  );
}
