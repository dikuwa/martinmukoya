"use client";

import { faqs } from "@/lib/site-data";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

export function FAQList({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? faqs.slice(0, limit) : faqs;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="grid gap-3">
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const contentId = `faq-answer-${index}`;

        return (
          <div
            key={faq.question}
            className={cn(
              "rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 transition-[border-color,background-color] duration-300",
              isOpen && "border-[rgba(198,97,63,0.35)] bg-[rgba(198,97,63,0.06)]"
            )}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-[18px] px-2 py-4 text-left font-display text-lg font-black text-[color:var(--text-strong)] transition hover:bg-white/[0.04]"
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <span>{faq.question}</span>
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[color:var(--border-subtle)] text-[color:var(--accent)] transition duration-300",
                  isOpen && "rotate-45 bg-[color:var(--accent)] text-white"
                )}
              >
                <Plus size={16} strokeWidth={3} />
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
