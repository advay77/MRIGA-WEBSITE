"use client";

import { useEffect } from "react";

// Adds "in" to every [data-reveal] element as it scrolls into view (CSS does the motion), and
// counts [data-count] numbers up from zero. The real number is in the HTML, so search engines and
// people who prefer reduced motion simply see it. Skipped entirely for people who prefer reduced motion.
export function Reveal() {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("in"));
      return;
    }
    const countUp = (element: HTMLElement) => {
      const target = Number(element.dataset.count);
      if (!Number.isFinite(target)) return;
      // Timers rather than requestAnimationFrame: rAF stops in background tabs, which would
      // leave the number stuck at 0. The final value is always written at the end.
      element.textContent = "0";
      const start = Date.now();
      const timer = window.setInterval(() => {
        const progress = Math.min(1, (Date.now() - start) / 1200);
        element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress >= 1) window.clearInterval(timer);
      }, 30);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.classList.add("in");
        element.querySelectorAll<HTMLElement>("[data-count]").forEach(countUp);
        observer.unobserve(element);
      }
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return null;
}
