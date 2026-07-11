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

    gsap.fromTo(
      ".tl-hero-schedule-block",
      { opacity: 0, y: 12 },
      { opacity: 0.78, y: 0, duration: 0.65, stagger: 0.08, ease: "power3.out" },
    );

    gsap.utils.toArray<HTMLElement>(".tl-landing-hero-proof .tls-rail-surface").forEach((element) => {
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

    gsap.utils.toArray<HTMLElement>(".tls-features .tls-product-rail").forEach((rail) => {
      const storyPage = rail.closest<HTMLElement>(".tls-story-page");
      if (!storyPage) return;

      const proofs = gsap.utils.toArray<HTMLElement>("[data-rail-proof]", rail);
      const chapters = gsap.utils.toArray<HTMLElement>(".tls-story-narrative > .tls-story-section:not(.tls-final-action)", storyPage);
      if (!proofs.length || !chapters.length) return;

      const showProof = (index: number) => {
        const activeProof = proofs[index];
        const activeChapter = chapters[index];
        if (!activeProof || !activeChapter) return;
        const chapterOffset = activeChapter.getBoundingClientRect().top - rail.getBoundingClientRect().top;

        rail.dataset.railActive = activeProof.dataset.railProof ?? "mobile";
        proofs.forEach((proof, proofIndex) => {
          gsap.to(proof, {
            autoAlpha: proofIndex === index ? 1 : 0,
            scale: proofIndex === index ? 1 : 0.96,
            y: proofIndex === index ? chapterOffset : 0,
            duration: 0.28,
            ease: "power2.out",
            overwrite: true,
          });
        });
      };

      gsap.set(proofs, { autoAlpha: 0, scale: 0.96, y: 0 });
      showProof(0);

      chapters.forEach((chapter, index) => {
        ScrollTrigger.create({
          trigger: chapter,
          start: "top 60%",
          end: "bottom 40%",
          onEnter: () => showProof(index),
          onEnterBack: () => showProof(index),
        });
      });
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
