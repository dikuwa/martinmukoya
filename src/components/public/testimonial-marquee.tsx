"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type Testimonial = {
  id?: string;
  clientName: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  image?: string | null;
};

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="flex w-[min(72vw,24rem)] shrink-0 flex-col rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/80 p-7 shadow-[0_3px_10px_rgba(0,0,0,0.04)] backdrop-blur-sm dark:bg-[color:var(--surface)]/60">
      <p className="text-4xl leading-none text-[color:var(--primary)]/40">&ldquo;</p>
      <p className="mt-3 flex-1 text-sm leading-7 text-[color:var(--text-normal)]">
        {item.quote}
      </p>
      <div className="mt-6 flex items-center gap-3 border-t border-[color:var(--border-subtle)] pt-4">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
          <Image src={item.image || "/assets/testimonials/testimonials.png"} alt={item.clientName} fill className="object-cover" sizes="36px" />
        </div>
        <div>
          <p className="text-sm font-bold text-[color:var(--text-strong)]">{item.clientName}</p>
          {item.role && (
            <p className="text-xs text-[color:var(--text-faint)]">
              {item.role}{item.company ? ` · ${item.company}` : ""}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Computed card width for seamless-loop calculations.
 * Matches w-[min(72vw,24rem)] + gap-5 (20px).
 */
function getCardWidth(): number {
  if (typeof window === "undefined") return 24 * 16 + 20;
  const vw = window.innerWidth;
  const maxRem = 24 * 16;
  return Math.min(72 * vw / 100, maxRem) + 20;
}

function MarqueeRow({
  items,
  direction,
  speed = 0.04,
  initialOffset = 0
}: {
  items: Testimonial[];
  direction: "ltr" | "rtl";
  speed?: number;
  initialOffset?: number;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(initialOffset);
  const lastTimeRef = useRef(0);

  // Drag state
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);

  // Duplicate items 3x for seamless looping
  const duplicated = [...items, ...items, ...items];

  // Compute total width of one set
  const getTotalWidth = useCallback(() => getCardWidth() * items.length, [items.length]);

  // --- Auto-scroll animation loop ---
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    function animate(timestamp: number) {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (!isPaused && !isDragging && rowRef.current) {
        const totalWidth = getTotalWidth();

        if (direction === "ltr") {
          posRef.current += delta * speed;
          // LTR: start at -(2 * totalWidth), loop back when we reach 0
          if (posRef.current >= 0) {
            posRef.current = -(2 * totalWidth);
          }
        } else {
          posRef.current -= delta * speed;
          // RTL: start at 0, loop back when we go past -totalWidth
          if (posRef.current <= -totalWidth) {
            posRef.current = 0;
          }
        }

        rowRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPaused, isDragging, direction, speed, getTotalWidth]);

  // Reset animation ref when dragging ends (in case speed changes matter)
  useEffect(() => {
    if (!isDragging && rowRef.current) {
      rowRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
    }
  }, [isDragging]);

  // --- Drag / Swipe handlers ---
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = clientX;
    dragStartPos.current = posRef.current;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!rowRef.current) return;
    const delta = clientX - dragStartX.current;
    posRef.current = dragStartPos.current + delta;
    rowRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (rowRef.current) {
      rowRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);

    const onMove = (ev: MouseEvent) => handleDragMove(ev.clientX);
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      handleDragEnd();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [handleDragStart, handleDragMove, handleDragEnd]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  return (
    <div
      className="relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onMouseEnter={() => { if (!isDragging) setIsPaused(true); }}
      onMouseLeave={() => { if (!isDragging) setIsPaused(false); }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/60 to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/60 to-transparent md:w-32" />
      <div
        ref={rowRef}
        className="flex gap-5 will-change-transform"
        style={{ transform: `translate3d(0px, 0, 0)` }}
      >
        {duplicated.map((item, i) => (
          <TestimonialCard key={`${direction}-${item.clientName}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function TestimonialMarquee({ items }: { items: Testimonial[] }) {
  if (!items.length) return null;

  // Total width of one set for initial offset calculation
  const cardW = 24 * 16 + 20;
  const setWidth = cardW * items.length;

  return (
    <div className="relative mt-10">
      {/* Top row - LTR (moves left to right). Start at -(2 * setWidth) so the
          third copy is visible; scrolls right through set3→set2→set1 seamlessly. */}
      <MarqueeRow items={items} direction="ltr" speed={0.035} initialOffset={-(2 * setWidth)} />

      {/* Bottom row - RTL (moves right to left) */}
      <div className="mt-5">
        <MarqueeRow items={items} direction="rtl" speed={0.04} />
      </div>
    </div>
  );
}
