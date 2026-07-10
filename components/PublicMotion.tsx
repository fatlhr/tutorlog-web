"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function PublicMotion() {
  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      return;
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    gsap.utils.toArray<HTMLElement>(".tls-story-rail .tls-rail-surface, .tl-landing-hero-proof .tls-rail-surface").forEach((element) => {
      gsap.fromTo(
        element,
        { scale: 0.96, opacity: 0.35 },
        {
          scale: 1,
          opacity: 1,
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

    gsap.utils.toArray<HTMLElement>(".tl-landing-feature-rows .tls-rail-surface").forEach((element) => {
      gsap.fromTo(
        element,
        { scale: 0.98 },
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
  }, []);

  return null;
}
