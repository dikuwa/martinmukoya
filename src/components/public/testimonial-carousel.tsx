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

const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds between auto-scrolls
const PAUSE_RESUME_DELAY = 4000; // 4 seconds after interaction before resuming

export function TestimonialCarousel({ items, siteSlug }: { items: Testimonial[]; siteSlug?: string }) {
  const isMartinMukoya = siteSlug !== "flextech-media";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cardWidth, setCardWidth] = useState(420);

  // Measure card width (card + gap) after mount and on resize
  useEffect(() => {
    function measure() {
      const el = scrollRef.current;
      if (!el || !el.children[0]) return;
      const first = el.children[0] as HTMLElement;
      const gap = 20; // gap-5 = 20px
      setCardWidth(first.offsetWidth + gap);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Scroll to a specific index
  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * cardWidth, behavior: "smooth" });
  }, [cardWidth]);

  // Pause auto-scroll temporarily, then resume
  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_RESUME_DELAY);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % items.length;
      scrollToIndex(nextIndex);
      setCurrentIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, items.length, scrollToIndex]);

  // Sync index on manual scroll (user drags/swipes the track)
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || cardWidth <= 0) return;
    const idx = Math.round(el.scrollLeft / cardWidth);
    if (idx !== currentIndex && idx >= 0 && idx < items.length) {
      setCurrentIndex(idx);
    }
  }, [cardWidth, currentIndex, items.length]);

  // Clean up pause timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []);

  // Pause auto-scroll while hovering
  function handleMouseEnter() {
    setIsPaused(true);
  }

  function handleMouseLeave() {
    // Resume after a short delay when leaving
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/40 to-transparent" />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-5 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: "x mandatory",
            ...(isMartinMukoya
              ? {
                  maskImage: `linear-gradient(to right, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%), linear-gradient(to bottom, black 0px, black calc(100% - 40px), transparent 100%)`,
                  WebkitMaskImage: `linear-gradient(to right, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%), linear-gradient(to bottom, black 0px, black calc(100% - 40px), transparent 100%)`,
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in",
                }
              : undefined)
          }}
        >
          {items.map((item) => (
            <article
              key={item.clientName}
              className="flex min-h-[24rem] w-[min(82vw,23rem)] shrink-0 flex-col rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_3px_10px_rgba(0,0,0,0.06)]"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
                <Image src={item.image || "/assets/testimonials/testimonials.png"} alt={item.clientName} fill className="object-cover" sizes="64px" />
              </div>
              <p className="mt-12 text-4xl leading-none text-[color:var(--primary)]">“</p>
              <p className="mt-4 font-display text-[clamp(1.45rem,calc(1.2rem+0.9vw),1.9rem)] font-black leading-tight text-[color:var(--text-strong)]">
                {item.quote}
              </p>
              <div className="mt-auto border-l border-[color:var(--border-subtle)] pl-5">
                <p className="font-bold text-[color:var(--text-strong)]">{item.clientName}</p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--text-faint)]">
                  {item.role} · {item.company}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => {
                  scrollToIndex(idx);
                  setCurrentIndex(idx);
                  pauseAutoScroll();
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-6 bg-[color:var(--primary)]"
                    : "w-2 bg-[color:var(--border-subtle)] hover:bg-[color:var(--text-faint)]"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
