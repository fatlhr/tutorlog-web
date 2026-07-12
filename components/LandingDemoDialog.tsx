"use client";

import { useCallback, useRef, useState } from "react";
import { PlayCircle, X } from "@phosphor-icons/react";
import useAccessibleDialog from "@/components/useAccessibleDialog";

const demoUrl = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&modestbranding=1";

export default function LandingDemoDialog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useAccessibleDialog({ open, onClose: close, triggerRef, dialogRef, initialFocusRef: closeRef });

  return (
    <>
      <button ref={triggerRef} className="tl-button tl-button-demo" type="button" onClick={() => setOpen(true)}>
        <PlayCircle size={18} weight="fill" aria-hidden="true" />
        <span>Lihat demo</span>
      </button>
      {open ? (
        <div className="tl-demo-backdrop" role="presentation" onMouseDown={close}>
          <section
            ref={dialogRef}
            className="tl-demo-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Preview sementara TutorLog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span
              data-focus-guard="start"
              tabIndex={0}
              aria-hidden="true"
              style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              onFocus={() => frameRef.current?.focus()}
            />
            <div className="tl-demo-dialog-header">
              <div>
                <p className="tl-kicker">Video contoh sementara</p>
                <h2>Melihat format demo.</h2>
                <p>Rekaman TutorLog sedang disiapkan. Video ini dipakai sementara untuk mencoba tampilan pemutar.</p>
              </div>
              <button ref={closeRef} className="tl-demo-close" type="button" aria-label="Tutup demo" onClick={close}>
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <div className="tl-demo-video">
              <iframe
                ref={frameRef}
                src={demoUrl}
                title="Video contoh sementara"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <span
              data-focus-guard="end"
              tabIndex={0}
              aria-hidden="true"
              style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              onFocus={() => closeRef.current?.focus()}
            />
          </section>
        </div>
      ) : null}
    </>
  );
}
