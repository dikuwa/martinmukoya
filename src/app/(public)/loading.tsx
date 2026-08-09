"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  PublicSkeletonArticleRow,
  PublicSkeletonCard,
  PublicSkeletonFaq,
  PublicSkeletonFormSplit,
  PublicSkeletonGrid,
  PublicSkeletonHero,
  PublicSkeletonPageHeader,
  PublicSkeletonText,
} from "@/components/ui/skeleton-card";
import { cn } from "@/lib/utils";

/**
 * Public route-group loading state (shown while RSC streams in).
 *
 * Content-aware: reads the current pathname and renders a skeleton tailored to
 * that page's real layout, so every route doesn't show the identical loader.
 * Rendered with pure CSS shimmer + a stagger fade (no animation JS), so it's
 * as light and fast as possible. `prefers-reduced-motion` is honoured by the
 * global media query.
 */

function Zone({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <div
      className={cn("public-loader-enter w-full", className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">{children}</div>;
}

export default function PublicLoading() {
  const pathname = usePathname() ?? "/";

  if (pathname.startsWith("/projects") || pathname.startsWith("/blog")) {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <PublicSkeletonPageHeader align="left" />
        </Zone>
        <Zone delay={0.08}>
          <Container>
            {pathname.startsWith("/blog") ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <PublicSkeletonArticleRow key={i} />
                ))}
              </div>
            ) : (
              <PublicSkeletonGrid count={6} />
            )}
          </Container>
        </Zone>
      </main>
    );
  }

  if (pathname.startsWith("/services")) {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <PublicSkeletonPageHeader />
        </Zone>
        <Zone delay={0.08}>
          <Container>
            <div className="grid items-stretch gap-5 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <PublicSkeletonCard key={i} />
              ))}
            </div>
          </Container>
        </Zone>
      </main>
    );
  }

  if (pathname.startsWith("/contact") || pathname.startsWith("/start-project")) {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <PublicSkeletonPageHeader align="left" />
        </Zone>
        <Zone delay={0.08}>
          <Container>
            <PublicSkeletonFormSplit />
          </Container>
        </Zone>
      </main>
    );
  }

  if (pathname.startsWith("/faq")) {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <PublicSkeletonPageHeader />
        </Zone>
        <Zone delay={0.08}>
          <Container>
            <PublicSkeletonFaq count={4} />
          </Container>
        </Zone>
      </main>
    );
  }

  if (
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/documents") ||
    pathname.startsWith("/d/")
  ) {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <Container>
            <PublicSkeletonText lines={8} />
          </Container>
        </Zone>
      </main>
    );
  }

  if (pathname.startsWith("/about")) {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <PublicSkeletonPageHeader />
        </Zone>
        <Zone delay={0.1}>
          <Container>
            <div className="grid gap-8 lg:grid-cols-2">
              <PublicSkeletonText head={false} lines={7} />
              <div className="public-skeleton aspect-[4/5] w-full rounded-[22px]" />
            </div>
          </Container>
        </Zone>
      </main>
    );
  }

  // Default: homepage — hero + a projects grid + services list.
  return (
    <main aria-busy="true" aria-label="Loading page content">
      <Zone>
        <PublicSkeletonHero />
      </Zone>
      <Zone delay={0.08}>
        <Container>
          <div className="mb-8 max-w-3xl space-y-3">
            <div className="public-skeleton h-4 w-20 rounded-full" />
            <div className="public-skeleton h-8 w-2/3 rounded-lg" />
            <div className="public-skeleton h-4 w-1/2 rounded" />
          </div>
          <PublicSkeletonGrid count={3} />
        </Container>
      </Zone>
      <Zone delay={0.16}>
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <PublicSkeletonCard key={i} />
            ))}
          </div>
        </Container>
      </Zone>
    </main>
  );
}
