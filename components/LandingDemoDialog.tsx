"use client";

import { useEffect, useRef, useState } from "react";
import { PlayCircle, X } from "@phosphor-icons/react";

const demoUrl = "https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ?rel=0&modestbranding=1";

export default function LandingDemoDialog() {
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
      <button ref={triggerRef} className="tl-button tl-button-demo" type="button" onClick={() => setOpen(true)}>
        <PlayCircle size={18} weight="fill" aria-hidden="true" />
        <span>Lihat demo</span>
      </button>
      {open ? (
        <div className="tl-demo-backdrop" role="presentation" onMouseDown={close}>
          <section className="tl-demo-dialog" role="dialog" aria-modal="true" aria-label="Demo TutorLog" onMouseDown={(event) => event.stopPropagation()}>
            <div className="tl-demo-dialog-header">
              <div>
                <p className="tl-kicker">Demo sementara</p>
                <h2>Melihat alur TutorLog.</h2>
              </div>
              <button ref={closeRef} className="tl-demo-close" type="button" aria-label="Tutup demo" onClick={close}>
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </div>
            <div className="tl-demo-video">
              <iframe
                src={demoUrl}
                title="Video demo TutorLog"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
