"use client";

/**
 * gsap.tsx — React-safe GSAP animation primitives for the public site.
 *
 * All components:
 *  - run entirely on the client (never in the RSC / SSR output);
 *  - scope tweens with `gsap.context()` so we can `ctx.revert()` on unmount
 *    (clean teardown, no leaked ScrollTriggers between route changes / HMR);
 *  - skip every effect when `prefers-reduced-motion` is active, leaving the
 *    content fully visible (markup is server-rendered at opacity 1);
 *  - only animate `transform` + `opacity` (GPU-composited, no layout thrash).
 *
 * Exports
 *   GsapReveal    — fade + rise a single block as it scrolls into view.
 *   GsapStagger   — stagger the DIRECT children of the container on scroll.
 *   GsapEntrance  — on-mount cascade for above-the-fold UI (e.g. the loader).
 *   GsapParallax  — scroll-linked vertical drift for decorative layers.
 */

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

// Avoid the React SSR `useLayoutEffect` warning: on the server we no-op,
// on the client we measure/lay out before paint (no first-frame flash).
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const REDUCED_EASE = "power2.out";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay (s) before the reveal begins once triggered. */
  delay?: number;
  /** Upward travel (px) from the starting position. */
  y?: number;
  duration?: number;
  /** Reveal only once (default). Set false to re-animate on every entry. */
  once?: boolean;
};

/**
 * Scroll-triggered fade + rise. Content stays rendered at full opacity until
 * the trigger fires (no flash for above-the-fold elements), then it animates
 * from `opacity:0` to visible.
 */
export function GsapReveal({
  children,
  className,
  delay = 0,
  y = 24,
  duration = 0.7,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once,
        onEnter: () => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y },
            {
              autoAlpha: 1,
              y: 0,
              delay,
              duration,
              ease: REDUCED_EASE,
              clearProps: "transform,opacity,visibility",
              onComplete: () => trigger.kill(),
            },
          );
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, y, duration, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  /** Seconds between each child. */
  stagger?: number;
  delay?: number;
  duration?: number;
  once?: boolean;
  start?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "children">;

/**
 * Stagger the DIRECT children of the container as the container scrolls into
 * view. Pass the grid/list element here and keep each cell as a plain child.
 */
export function GsapStagger({
  children,
  className,
  y = 28,
  stagger = 0.09,
  delay = 0,
  duration = 0.6,
  once = true,
  start = "top 85%",
  ...restProps
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const cells = Array.from(el.children);
    if (cells.length === 0) return;

    const ctx = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start,
        once,
        onEnter: () => {
          gsap.fromTo(
            cells,
            { autoAlpha: 0, y },
            {
              autoAlpha: 1,
              y: 0,
              delay,
              duration,
              stagger,
              ease: REDUCED_EASE,
              clearProps: "transform,opacity,visibility",
              onComplete: () => trigger.kill(),
            },
          );
        },
      });
    }, el);

    return () => ctx.revert();
  }, [y, stagger, delay, duration, once, start]);

  return (
    <div ref={ref} className={className} {...restProps}>
      {children}
    </div>
  );
}

type EntranceProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  stagger?: number;
  delay?: number;
  duration?: number;
} & Pick<React.HTMLAttributes<HTMLDivElement>, "aria-label" | "aria-busy">;

/**
 * On-mount cascade for above-the-fold UI (skeleton loader, hero intro). Unlike
 * GsapReveal this *does* pre-hide its children (via `fromTo`) so the entrance
 * reads as a deliberate sequence from the very first frame.
 */
export function GsapEntrance({
  children,
  className,
  y = 20,
  stagger = 0.08,
  delay = 0.04,
  duration = 0.6,
  ...restProps
}: EntranceProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cells = Array.from(el.children);
    if (cells.length === 0) return;

    // Respect reduced motion: leave everything visible, no tweens.
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cells,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          delay,
          duration,
          stagger,
          ease: REDUCED_EASE,
          clearProps: "transform,opacity,visibility",
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, stagger, delay, duration]);

  return (
    <div ref={ref} className={className} {...restProps}>
      {children}
    </div>
  );
}

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  /** How quickly the layer drifts relative to scroll. Keep 0.05–0.2. */
  speed?: number;
};

/**
 * Scroll-linked vertical drift for decorative layers (glows, faint patterns).
 * Decorative only — never wrap interactive content that must stay reachable.
 */
export function GsapParallax({
  children,
  className,
  speed = 0.12,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: speed * 60,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}