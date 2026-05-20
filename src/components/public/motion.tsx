"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealDirection = "up" | "down" | "left" | "right" | "none";

function getOffset(direction: RevealDirection, distance: number) {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "none":
      return {};
    case "up":
    default:
      return { y: distance };
  }
}

export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 18,
  duration = 0.62,
  scale = 1
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  scale?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset = getOffset(direction, distance);
  const initial = scale === 1 ? { opacity: 0, ...offset } : { opacity: 0, scale, ...offset };

  return (
    <motion.div
      className={cn(className)}
      initial={prefersReducedMotion ? false : initial}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
