"use client";

import { useEffect, useRef, useState } from "react";
import HamburgerMenu from "./HamburgerMenu";

// Tombol hamburger + overlay menu mobile. Dipasang di dalam .mob-nav.
export default function MenuToggle() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="hamburger"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : setOpen(true))}
      >
        <span></span><span></span><span></span>
      </button>
      <HamburgerMenu open={open} onClose={closeMenu} />
    </>
  );
}
