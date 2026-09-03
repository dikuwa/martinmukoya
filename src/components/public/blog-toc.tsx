"use client";

import { useEffect, useState } from "react";
import type { BlogHeading } from "@/lib/blog-headings";
import { cn } from "@/lib/utils";

/**
 * Sticky table of contents for blog posts. Observes the rendered headings and
 * highlights the one currently in view; each link anchors to the heading id
 * assigned by `blog-markdown.tsx` (same slugify source).
 */
export function BlogToc({ headings }: { headings: BlogHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      // Track headings once they cross into the band just below the sticky header
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className="lg:sticky lg:top-24">
      <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--text-faint)]">
        On this page
      </p>
      <ul className="mt-4 space-y-1 border-l border-[color:var(--border-subtle)]">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "-ml-px block border-l-2 py-1.5 text-sm font-semibold leading-5 transition",
                heading.level === 3 ? "pl-6" : "pl-4",
                activeId === heading.id
                  ? "border-[color:var(--primary)] text-[color:var(--primary)]"
                  : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text-strong)]"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}