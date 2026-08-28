"use client";

import { useEffect } from "react";

export default function PublicMotion() {
  useEffect(() => {
    let context: { revert: () => void } | undefined;
    let cancelled = false;

    void (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reduce) {
          return;
        }

        if (window.matchMedia("(max-width: 767px)").matches) {
          const mobileNotes = gsap.utils.toArray<HTMLElement>(
            ".tl-landing-hero .tl-hero-schedule-block-raka, .tl-landing-hero .tl-hero-schedule-block-nala",
          );

          if (mobileNotes.length) {
            gsap.fromTo(
              mobileNotes,
              { opacity: 0, y: 8 },
              { opacity: 0.88, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out" },
            );
          }

          return;
        }

        gsap.fromTo(
          ".tl-hero-schedule-block",
          { opacity: 0, y: 12 },
          { opacity: 0.78, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out" },
        );

        gsap.utils.toArray<HTMLElement>(".tl-landing-hero-proof .tls-rail-surface").forEach((element) => {
          gsap.fromTo(
            element,
            { scale: 0.96 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top 80%",
                end: "bottom 28%",
                scrub: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>(".tls-feature-evidence-group .tls-rail-surface").forEach((element) => {
          gsap.fromTo(
            element,
            { scale: 0.96, opacity: 0.72 },
            {
              scale: 1,
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top 82%",
                end: "bottom 32%",
                scrub: true,
              },
            },
          );
        });
      });
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, []);

  return null;
}
