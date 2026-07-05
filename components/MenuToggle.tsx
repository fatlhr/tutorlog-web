"use client";

import { useEffect, useState } from "react";
import HamburgerMenu from "./HamburgerMenu";

// Tombol hamburger + overlay menu mobile. Dipasang di dalam .mob-nav.
export default function MenuToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
        className="hamburger"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span></span><span></span><span></span>
      </button>
      <HamburgerMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
