"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function LandingMotion() {
  useGSAP(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.fromTo(
      ".tl-hero-copy > *",
      { y: 18 },
      {
        y: 0,
        duration: 0.72,
        ease: "power3.out",
        stagger: 0.08,
      },
    );

    gsap.fromTo(
      ".tl-preview-stack",
      { opacity: 0, y: 28, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.18,
      },
    );

    gsap.utils.toArray<HTMLElement>(".tl-motion-card").forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0.86, y: 34, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top 86%",
            end: "top 48%",
            scrub: 0.8,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>(".tl-flow-product").forEach((product) => {
      gsap.fromTo(
        product,
        { opacity: 0.86, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: product,
            start: "top 88%",
            end: "bottom 42%",
            scrub: 0.8,
          },
        },
      );
    });

    gsap.utils.toArray<HTMLElement>(".tl-word").forEach((word, index) => {
      gsap.fromTo(
        word,
        { opacity: 0.28 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".tl-story-text",
            start: "top 78%",
            end: "bottom 40%",
            scrub: true,
          },
          delay: index * 0.02,
        },
      );
    });
  }, []);

  return null;
}
