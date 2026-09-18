'use client';

import { useEffect } from 'react';

/**
 * Drives the .reveal / .reveal-visible CSS classes (see globals.css).
 * Mount once per page (e.g. at the top of HomePage). No props, no
 * per-element wrapper component needed — just add className="reveal"
 * to anything that should fade/slide in as it enters the viewport.
 */
export default function RevealInit() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return null;
}
