"use client";

/**
 * motion.tsx — public-site animation primitives.
 *
 * Rules:
 *  - respects prefers-reduced-motion via useReducedMotion()
 *  - animates only transform + opacity (GPU-composited, no layout thrash)
 *  - easing: [0.16, 1, 0.3, 1]  (expo-out — quick start, gentle settle)
 *
 * Exports
 *   Reveal        — whileInView fade + translate (existing, backward-compatible)
 *   BlurFade      — opacity + blur-collapse entrance (premium headlines)
 *   StaggerGroup  — parent that staggers direct StaggerItem children
 *   StaggerItem   — child for StaggerGroup
 *   ParallaxLayer — scroll-linked vertical shift for decorative elements
 *   FadeIn        — plain opacity fade, no movement
 */

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Shared ────────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;
const VIEWPORT = { once: true, margin: "-72px" } as const;

type RevealDirection = "up" | "down" | "left" | "right" | "none";

function dirOffset(dir: RevealDirection, d: number) {
  switch (dir) {
    case "down":  return { y: -d };
    case "left":  return { x:  d };
    case "right": return { x: -d };
    case "none":  return {};
    default:      return { y:  d };
  }
}

// ─── Reveal ────────────────────────────────────────────────────────────────────

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 18,
  duration = 0.62,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  scale?: number;
}) {
  const shouldReduce = useReducedMotion();
  const offset = dirOffset(direction, distance);
  const initial =
    scale === 1
      ? { opacity: 0, ...offset }
      : { opacity: 0, scale, ...offset };

  return (
    <motion.div
      className={cn(className)}
      initial={shouldReduce ? false : initial}
      whileInView={shouldReduce ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── BlurFade ──────────────────────────────────────────────────────────────────
// Premium entrance: opacity 0→1 + blur 8px→0 + subtle y lift.
// Best for hero headlines, section titles, focal copy.

export function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.52,
  yOffset = 10,
  blur = "8px",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: string;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      initial={
        shouldReduce
          ? false
          : { opacity: 0, filter: `blur(${blur})`, y: yOffset }
      }
      whileInView={
        shouldReduce ? undefined : { opacity: 1, filter: "blur(0px)", y: 0 }
      }
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerGroup + StaggerItem ────────────────────────────────────────────────
// Wrap a mapped grid/list in StaggerGroup; each cell in StaggerItem.
// One IntersectionObserver fires the whole sequence — no per-item observers.
//
//   <StaggerGroup className="grid gap-5 md:grid-cols-3">
//     {items.map((item) => (
//       <StaggerItem key={item.id}><Card {...item} /></StaggerItem>
//     ))}
//   </StaggerGroup>

const itemVariantsFull = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

const itemVariantsReduced = { hidden: {}, visible: {} };

export function StaggerGroup({
  children,
  className,
  stagger = 0.08,
  delayStart = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayStart?: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduce ? 0 : stagger,
            delayChildren: delayStart,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      variants={shouldReduce ? itemVariantsReduced : itemVariantsFull}
    >
      {children}
    </motion.div>
  );
}

// ─── ParallaxLayer ─────────────────────────────────────────────────────────────
// Scroll-linked vertical shift. Use only for decorative backgrounds / glows.
// Keep speed 0.05–0.18 for subtlety.

export function ParallaxLayer({
  children,
  className,
  speed = 0.12,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const range = speed * 60;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${range}px`, `${range}px`]
  );

  if (shouldReduce) {
    return (
      <div className={cn(className)} ref={ref}>
        {children}
      </div>
    );
  }

  return (
    <motion.div className={cn(className)} ref={ref} style={{ y }}>
      {children}
    </motion.div>
  );
}

// ─── FadeIn ────────────────────────────────────────────────────────────────────
// Pure opacity fade — no movement. For dividers, secondary labels, bg elements.

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={cn(className)}
      initial={shouldReduce ? false : { opacity: 0 }}
      whileInView={shouldReduce ? undefined : { opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
