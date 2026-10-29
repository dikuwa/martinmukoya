"use client";

import Image from "next/image";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type Testimonial = {
  id?: string;
  clientName: string;
  role?: string | null;
  company?: string | null;
  quote: string;
  image?: string | null;
};

type DragDirection = "horizontal" | "vertical" | null;

const AUTO_SCROLL_INTERVAL = 3000;
const PAUSE_RESUME_DELAY = 4000;
const DRAG_THRESHOLD = 8;
const SETTLE_DELAY = 140;

export function TestimonialCarousel({ items, siteSlug }: { items: Testimonial[]; siteSlug?: string }) {
  const isMartinMukoya = siteSlug !== "flextech-media";
  const scrollRef = useRef<HTMLDivElement>(null);
  const physicalIndexRef = useRef(0);
  const settleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [cardWidth, setCardWidth] = useState(420);
  const dragRef = useRef<{
    direction: DragDirection;
    pointerId: number | null;
    scrollLeft: number;
    x: number;
    y: number;
  }>({
    direction: null,
    pointerId: null,
    scrollLeft: 0,
    x: 0,
    y: 0
  });

  const realItemsCount = items.length;
  const duplicatedItems = [...items, ...items, ...items];

  const jumpWithoutAnimation = useCallback((left: number) => {
    const el = scrollRef.current;
    if (!el) return;

    const previousBehavior = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    el.scrollLeft = left;
    el.style.scrollBehavior = previousBehavior;
  }, []);

  const normalizePhysicalIndex = useCallback((rawIndex: number) => {
    if (!realItemsCount || cardWidth <= 0) return rawIndex;

    let normalized = rawIndex;

    if (rawIndex < realItemsCount) {
      normalized = rawIndex + realItemsCount;
    } else if (rawIndex >= realItemsCount * 2) {
      normalized = rawIndex - realItemsCount;
    }

    if (normalized !== rawIndex) {
      physicalIndexRef.current = normalized;
      jumpWithoutAnimation(normalized * cardWidth);
    }

    return normalized;
  }, [cardWidth, jumpWithoutAnimation, realItemsCount]);

  const syncLogicalIndex = useCallback((physicalIndex: number) => {
    if (!realItemsCount) return;
    const logicalIndex = ((physicalIndex % realItemsCount) + realItemsCount) % realItemsCount;
    setCurrentIndex(logicalIndex);
  }, [realItemsCount]);

  const settlePosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el || cardWidth <= 0 || !realItemsCount) return;

    const rawIndex = Math.round(el.scrollLeft / cardWidth);
    physicalIndexRef.current = rawIndex;
    syncLogicalIndex(rawIndex);
    normalizePhysicalIndex(rawIndex);
  }, [cardWidth, normalizePhysicalIndex, realItemsCount, syncLogicalIndex]);

  // Measure the actual rendered card + gap, then place the viewport on the
  // middle copy. Keeping a full copy on each side makes the wrap invisible.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !realItemsCount) return;

    const measureAndCenter = () => {
      const first = el.children[0] as HTMLElement | undefined;
      if (!first) return;

      const styles = window.getComputedStyle(el);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const nextCardWidth = first.getBoundingClientRect().width + gap;
      setCardWidth(nextCardWidth);

      const middleIndex = realItemsCount + currentIndex;
      physicalIndexRef.current = middleIndex;
      jumpWithoutAnimation(middleIndex * nextCardWidth);
    };

    measureAndCenter();

    const resizeObserver = new ResizeObserver(measureAndCenter);
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [currentIndex, jumpWithoutAnimation, realItemsCount]);

  const scrollToPhysicalIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el || cardWidth <= 0) return;

    physicalIndexRef.current = index;
    el.scrollTo({ left: index * cardWidth, behavior: "smooth" });
    syncLogicalIndex(index);
  }, [cardWidth, syncLogicalIndex]);

  const scrollToLogicalIndex = useCallback((logicalIndex: number) => {
    if (!realItemsCount) return;
    scrollToPhysicalIndex(realItemsCount + logicalIndex);
  }, [realItemsCount, scrollToPhysicalIndex]);

  const pauseAutoScroll = useCallback(() => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), PAUSE_RESUME_DELAY);
  }, []);

  const pauseWhileReading = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary || !scrollRef.current) return;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setIsPaused(true);
    dragRef.current = {
      direction: null,
      pointerId: event.pointerId,
      scrollLeft: scrollRef.current.scrollLeft,
      x: event.clientX,
      y: event.clientY
    };
  }, []);

  const resumeAfterReading = useCallback((event: PointerEvent<HTMLElement>) => {
    if (dragRef.current.pointerId === event.pointerId) {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      dragRef.current = {
        direction: null,
        pointerId: null,
        scrollLeft: 0,
        x: 0,
        y: 0
      };
    }
    pauseAutoScroll();
    settlePosition();
  }, [pauseAutoScroll, settlePosition]);

  const resumeIfNotDraggingHorizontally = useCallback((event: PointerEvent<HTMLElement>) => {
    if (dragRef.current.pointerId !== event.pointerId || dragRef.current.direction === "horizontal") return;
    dragRef.current = {
      direction: null,
      pointerId: null,
      scrollLeft: 0,
      x: 0,
      y: 0
    };
    pauseAutoScroll();
  }, [pauseAutoScroll]);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = scrollRef.current;
    if (!el || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (drag.direction === null) {
      if (absX <= DRAG_THRESHOLD && absY <= DRAG_THRESHOLD) return;

      if (absY > absX) {
        drag.direction = "vertical";
        return;
      }

      if (absX > absY && absX > DRAG_THRESHOLD) {
        drag.direction = "horizontal";
        if (!event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.setPointerCapture?.(event.pointerId);
        }
      }
    }

    if (drag.direction !== "horizontal") return;

    event.preventDefault();
    el.scrollLeft = drag.scrollLeft - dx;
  }, []);

  useEffect(() => {
    if (isPaused || realItemsCount <= 1) return;

    const interval = setInterval(() => {
      const nextPhysicalIndex = physicalIndexRef.current + 1;
      scrollToPhysicalIndex(nextPhysicalIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, realItemsCount, scrollToPhysicalIndex]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || cardWidth <= 0 || !realItemsCount) return;

    const rawIndex = Math.round(el.scrollLeft / cardWidth);
    physicalIndexRef.current = rawIndex;
    syncLogicalIndex(rawIndex);

    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    settleTimeoutRef.current = setTimeout(settlePosition, SETTLE_DELAY);
  }, [cardWidth, realItemsCount, settlePosition, syncLogicalIndex]);

  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current);
    };
  }, []);

  if (!items.length) return null;

  return (
    <div>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/40 to-transparent" />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onPointerMove={handlePointerMove}
          onPointerUp={resumeAfterReading}
          onPointerCancel={resumeAfterReading}
          onPointerLeave={resumeIfNotDraggingHorizontally}
          onLostPointerCapture={resumeAfterReading}
          className="testimonial-carousel testimonial-track flex cursor-grab gap-5 overflow-x-auto pb-4 scroll-smooth [scrollbar-width:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
          style={{
            scrollSnapType: "x mandatory",
            touchAction: "pan-y",
            ...(isMartinMukoya
              ? {
                  maskImage: "linear-gradient(to right, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%), linear-gradient(to bottom, black 0px, black calc(100% - 40px), transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent 0px, black 60px, black calc(100% - 60px), transparent 100%), linear-gradient(to bottom, black 0px, black calc(100% - 40px), transparent 100%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "source-in"
                }
              : undefined)
          }}
        >
          {duplicatedItems.map((item, index) => (
            <article
              key={`${item.clientName}-${index}`}
              onPointerDown={pauseWhileReading}
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

        {items.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to testimonial ${idx + 1}`}
                onClick={() => {
                  scrollToLogicalIndex(idx);
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
