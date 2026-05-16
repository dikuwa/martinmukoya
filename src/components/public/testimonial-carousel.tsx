"use client";

import type { testimonials } from "@/lib/site-data";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

type Testimonial = (typeof testimonials)[number];

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "prev" | "next") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "next" ? 420 : -420,
      behavior: "smooth"
    });
  }

  return (
    <div>
      <div className="relative mt-10">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/40 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-[color:var(--background-elevated)] via-[color:var(--background-elevated)]/40 to-transparent" />
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <article
              key={item.clientName}
              className="flex min-h-[24rem] w-[min(82vw,23rem)] shrink-0 flex-col rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 shadow-[0_3px_10px_rgba(0,0,0,0.06)]"
            >
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
                <Image src={item.image} alt={item.clientName} fill className="object-cover" sizes="64px" />
              </div>
              <p className="mt-12 text-4xl leading-none text-[color:var(--accent)]">“</p>
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
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => scroll("prev")}
          className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-strong)] transition hover:border-[color:var(--accent)]"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => scroll("next")}
          className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-strong)] transition hover:border-[color:var(--accent)]"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
