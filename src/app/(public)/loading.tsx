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

const FLEXTECH_DOMAINS = ["flextech-media.com", "www.flextech-media.com", "flextech-media.localhost", "flextech-media.vercel.app"];

function isFlexTechHost(host: string) {
  return FLEXTECH_DOMAINS.some((d) => host === d || host.endsWith("." + d));
}

function getSiteSlug(): "martin-mukoya" | "flextech-media" {
  if (typeof window === "undefined") return "martin-mukoya";
  return isFlexTechHost(window.location.hostname) ? "flextech-media" : "martin-mukoya";
}

/**
 * Public route-group loading state (shown while RSC streams in).
 *
 * Content-aware: reads the current pathname and renders a skeleton tailored to
 * that page's real layout, so every route doesn't show the identical loader.
 * Site-aware: detects flextech-media vs martin-mukoya and shows appropriate
 * skeletons for each site's distinct page structures.
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
  const siteSlug = getSiteSlug();

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
  // Site-specific: flextech-media has a different hero/layout structure
  if (siteSlug === "flextech-media") {
    return (
      <main aria-busy="true" aria-label="Loading page content">
        <Zone>
          <div
            aria-hidden="true"
            className={cn(
              "relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 overflow-hidden px-4 pb-12 pt-14 text-center sm:px-6 lg:pb-20 lg:pt-20"
            )}
          >
            {/* Availability chip */}
            <div className="public-skeleton h-6 w-36 rounded-full" />
            {/* Profile image with a soft halo behind it */}
            <div className="relative">
              <div className="public-skeleton-halo absolute -inset-8 rounded-full opacity-70" />
              <div className="public-skeleton relative h-28 w-28 rounded-full ring-1 ring-[color:var(--border-subtle)]" />
            </div>
            {/* Headline lines */}
            <div className="w-full max-w-xl space-y-3">
              <div className="public-skeleton mx-auto h-8 w-4/5 rounded-lg" />
              <div className="public-skeleton mx-auto h-8 w-3/5 rounded-lg" />
            </div>
            {/* Subtext */}
            <div className="w-full max-w-md space-y-2">
              <div className="public-skeleton mx-auto h-4 w-full rounded" />
              <div className="public-skeleton mx-auto h-4 w-4/5 rounded" />
            </div>
            {/* CTA buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="public-skeleton h-11 w-40 rounded-xl" />
              <div className="public-skeleton h-11 w-36 rounded-xl" />
            </div>
            {/* Tech chip strip */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[80, 96, 72, 88, 64, 76, 92, 68].map((w, i) => (
                <div
                  key={i}
                  className="public-skeleton h-7 rounded-full"
                  style={{ width: w }}
                />
              ))}
            </div>
          </div>
        </Zone>
        <Zone delay={0.08}>
          <Container>
            <PublicSkeletonGrid count={4} />
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
