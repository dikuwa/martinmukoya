/**
 * Shared GSAP wiring for the public site.
 *
 * Responsibilities:
 *  - Register plugins exactly once (idempotent, safe across HMR / re-mounts).
 *  - Match the design-system easing so GSAP motion feels native to the brand.
 *  - Expose a reduced-motion helper so every consumer can respect
 *    `prefers-reduced-motion` without duplicating the media query.
 *
 * This module must only be imported from `"use client"` components — GSAP is a
 * browser-only animation engine and should never be shipped to the RSC output.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// `gsap.registerPlugin` is idempotent, so calling this from many client
// component modules is safe and cheap.
gsap.registerPlugin(ScrollTrigger);

// Defaults tuned to the brand tokens used across the app
// (--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)). We use a slightly gentler
// power2.out for long-form scroll reveals so they settle softly.
gsap.defaults({
  ease: "power2.out",
  duration: 0.6,
  overwrite: "auto",
});

// Small quality-of-life + perf tweaks:
//  - `ignoreMobileResize` avoids re-measuring every trigger on mobile URL-bar
//    scroll, which is a common source of scroll "jank" on phones.
//  - `rememberSetup` helps when navigating with the App Router; each component
//    still calls ctx.revert() on unmount, so this is just a safeguard.
ScrollTrigger.config({
  ignoreMobileResize: true,
});

/** `true` when the OS asks for reduced motion. Always `false` on the server. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Re-measure scroll triggers after layout-settling events (fonts, images,
 * in-page toggles). Use sparingly — `ScrollTrigger.refresh()` can be costly.
 */
export function refreshScrollTrigger(): void {
  if (typeof window === "undefined") return;
  requestAnimationFrame(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger };