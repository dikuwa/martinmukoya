"use client";

/**
 * motion.tsx — public-site animation primitives using GSAP.
 *
 * Rules:
 *  - respects prefers-reduced-motion via useReducedMotion()
 *  - animates only transform + opacity (GPU-composited, no layout thrash)
 *  - easing: [0.16, 1, 0.3, 1]  (expo-out — quick start, gentle settle)
 *
 * These are lightweight wrappers. For scroll-triggered animations, see gsap.tsx.
 */

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power3.out";
const DURATION = 0.7;

function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ── Reveal ── */

interface RevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  duration?: number;
  scale?: number;
  className?: string;
}

export function Reveal({ children, delay = 0, direction = "up", distance = 30, duration = DURATION, scale, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const from: Record<string, number> = { opacity: 0 };
    if (direction === "up") from.y = distance;
    else if (direction === "down") from.y = -distance;
    else if (direction === "left") from.x = distance;
    else if (direction === "right") from.x = -distance;
    if (scale != null) from.scale = scale;

    gsap.set(el, from);

    const to: Record<string, number> = { opacity: 1, x: 0, y: 0 };
    if (scale != null) to.scale = 1;

    const tween = gsap.to(el, {
      ...to,
      duration,
      ease: EASE,
      delay,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });

    return () => { tween.kill(); };
  }, [delay, direction, distance, duration, scale, reduced]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className} style={{ opacity: 0 } as CSSProperties}>
      {children}
    </div>
  );
}

/* ── BlurFade ── */

interface BlurFadeProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function BlurFade({ children, delay = 0, className }: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    gsap.set(el, { opacity: 0, filter: "blur(8px)" });

    const tween = gsap.to(el, {
      opacity: 1,
      filter: "blur(0px)",
      duration: DURATION,
      ease: EASE,
      delay,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });

    return () => { tween.kill(); };
  }, [delay, reduced]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className} style={{ opacity: 0, filter: "blur(8px)" } as CSSProperties}>
      {children}
    </div>
  );
}

/* ── StaggerGroup ── */

interface StaggerGroupProps {
  children: ReactNode;
  stagger?: number;
  className?: string;
}

export function StaggerGroup({ children, stagger = 0.08, className }: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const items = el.children;
    if (!items.length) return;

    gsap.set(items, { opacity: 0, y: 20 });

    const tween = gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: DURATION,
      ease: EASE,
      stagger,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });

    return () => { tween.kill(); };
  }, [stagger, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ── StaggerItem ── */

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return <div className={className}>{children}</div>;
}

/* ── ParallaxLayer ── */

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxLayer({ children, speed = 0.15, className }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const tween = gsap.to(el, {
      y: () => speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => { tween.kill(); };
  }, [speed, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ── FadeIn ── */

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = DURATION, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    gsap.set(el, { opacity: 0 });

    const tween = gsap.to(el, {
      opacity: 1,
      duration,
      ease: EASE,
      delay,
    });

    return () => { tween.kill(); };
  }, [delay, duration, reduced]);

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <div ref={ref} className={className} style={{ opacity: 0 } as CSSProperties}>
      {children}
    </div>
  );
}
