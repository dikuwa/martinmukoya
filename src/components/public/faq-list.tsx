"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function FAQList({ limit }: { limit?: number }) {
  const items = typeof limit === "number" ? faqs.slice(0, limit) : faqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left font-display text-lg font-black text-[color:var(--text-strong)]"
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
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pt-4 text-sm leading-6 text-[color:var(--text-muted)]">
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
