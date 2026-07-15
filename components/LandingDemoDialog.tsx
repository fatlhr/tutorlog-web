"use client";

import { useCallback, useRef, useState } from "react";
import { PlayCircle, X } from "@phosphor-icons/react";
import { MarketingButton } from "@/components/public-ui/marketing-button";
import { PublicIconButton } from "@/components/public-ui/public-icon-button";
import {
  DialogNestingContext,
  useDialogBehavior,
} from "@/components/ui/use-dialog-behavior";

const demoUrl = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&modestbranding=1";

export default function LandingDemoDialog() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

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
      <MarketingButton
        buttonRef={triggerRef}
        type="button"
        variant="editorial"
        leadingIcon={<PlayCircle size={18} weight="fill" />}
        onClick={() => setOpen(true)}
      >
        Lihat demo
      </MarketingButton>
      {open ? (
        <DialogNestingContext.Provider value>
          <div className="tl-demo-backdrop" role="presentation" onMouseDown={close}>
            <section
              ref={dialogRef}
              className="tl-demo-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Preview sementara TutorLog"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                data-focus-guard="start"
                type="button"
                aria-label="Kembali ke video demo"
                style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                onFocus={() => frameRef.current?.focus()}
              />
              <div className="tl-demo-dialog-header">
                <div>
                  <p className="tl-kicker">Video contoh sementara</p>
                  <h2>Melihat format demo.</h2>
                  <p>Video ini hanya contoh sementara, bukan rekaman TutorLog. Rekaman TutorLog sedang disiapkan.</p>
                </div>
                <PublicIconButton
                  buttonRef={closeRef}
                  icon={<X size={20} weight="bold" />}
                  label="Tutup demo"
                  size="demo"
                  onClick={close}
                />
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
              <button
                data-focus-guard="end"
                type="button"
                aria-label="Kembali ke tombol tutup demo"
                style={{ position: "fixed", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
                onFocus={() => closeRef.current?.focus()}
              />
            </section>
          </div>
        </DialogNestingContext.Provider>
      ) : null}
    </>
  );
}
