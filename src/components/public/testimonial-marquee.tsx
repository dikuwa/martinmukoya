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
      <p className="text-4xl leading-none text-[color:var(--primary)]/40">"</p>
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

function MarqueeRow({
  items,
  direction,
  speed = 0.04
}: {
  items: Testimonial[];
  direction: "ltr" | "rtl";
  speed?: number;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const posRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Duplicate items 3x for seamless looping
  const duplicated = [...items, ...items, ...items];

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!isPaused && rowRef.current) {
      // LTR: move left→right (positive translate), RTL: move right→left (negative translate)
      posRef.current += direction === "ltr" ? delta * speed : -delta * speed;

      const cardWidth = 24 * 16 + 20; // w-96 (24rem) + gap (5 = 1.25rem)
      const totalWidth = cardWidth * items.length;

      // Reset when a full set has scrolled past
      if (direction === "ltr" && posRef.current >= totalWidth) {
        posRef.current = 0;
      } else if (direction === "rtl" && posRef.current <= -totalWidth) {
        posRef.current = 0;
      }

      rowRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
    }

    animRef.current = requestAnimationFrame(animate);
  }, [isPaused, direction, speed, items.length]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/60 to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/60 to-transparent md:w-32" />
      <div
        ref={rowRef}
        className="flex gap-5 will-change-transform"
        style={{ transform: "translate3d(0, 0, 0)" }}
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

  return (
    <div className="relative mt-10">
      {/* Top row - LTR (moves left to right) */}
      <MarqueeRow items={items} direction="ltr" speed={0.04} />

      {/* Bottom row - RTL (moves right to left) */}
      <div className="mt-5">
        <MarqueeRow items={items} direction="rtl" speed={0.04} />
      </div>
    </div>
  );
}
