"use client";

import { faqs } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

type FAQItem = (typeof faqs)[number];

export function FAQList({ items = faqs, limit, variant = "default" }: { items?: FAQItem[]; limit?: number; variant?: "default" | "soft" }) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-3">
      {visibleItems.map((faq, index) => {
        const isOpen = openIndex === index;
        const contentId = `faq-answer-${index}`;

        return (
          <div
            key={faq.question}
            className={cn(
              variant === "soft"
                ? "rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/70 p-4 backdrop-blur-sm transition-[border-color,background-color] duration-300"
                : "rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 transition-[border-color,background-color] duration-300",
              isOpen && (variant === "soft"
                ? "border-[color:var(--primary)]/40 bg-[color:var(--primary)]/[0.04]"
                : "border-[color:var(--primary)] bg-[color:var(--primary)]/10")
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-4 rounded-[18px] text-left font-display transition",
                variant === "soft" ? "px-2 py-3 text-base font-black text-[color:var(--text-strong)]" : "px-2 py-4 text-lg font-black text-[color:var(--text-strong)] hover:bg-white/[0.04]"
              )}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span className="text-balance">{faq.question}</span>
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border transition duration-300",
                  variant === "soft"
                    ? cn(
                        "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-faint)]",
                        isOpen && "rotate-45 border-[color:var(--primary)]/40 bg-[color:var(--primary)]/10 text-[color:var(--primary)]"
                      )
                    : cn(
                        "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-muted)]",
                        isOpen && "rotate-45 border-[color:var(--primary)] bg-[color:var(--primary)] text-white"
                      )
                )}
              >
                <Plus size={variant === "soft" ? 14 : 16} strokeWidth={3} />
              </span>
            </button>
            <div
              id={contentId}
              aria-hidden={!isOpen}
              className={cn(
                "overflow-hidden transition-[max-height,opacity] duration-300 ease-out",
                isOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="pt-4">
                <p className="max-w-3xl text-sm leading-6 text-[color:var(--text-muted)]">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
