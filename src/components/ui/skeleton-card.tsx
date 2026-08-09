import { cn } from "@/lib/utils";

// ─── Admin skeletons ────────────────────────────────────────────────────────
// Used by admin dashboard pages. Shimmer is driven by .admin-skeleton in globals.css.

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "admin-skeleton rounded-[var(--radius)] border border-[color:var(--border-subtle)] p-5",
        className
      )}
    >
      <div className="aspect-[16/10] rounded-[calc(var(--radius)*0.7)] bg-[color:var(--border-subtle)]" />
      <div className="mt-5 h-4 w-2/3 rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-3 h-3 w-full rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-2 h-3 w-4/5 rounded bg-[color:var(--border-subtle)]" />
    </div>
  );
}

export function SkeletonRow() {
  return <div className="admin-skeleton h-12 w-full rounded-lg" />;
}

export function SkeletonText({
  className,
  width = "full",
}: {
  className?: string;
  width?: string;
}) {
  return (
    <div
      className={cn("admin-skeleton h-4 rounded", className)}
      style={{ width }}
    />
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "admin-skeleton rounded-[var(--radius)] border border-[color:var(--border-subtle)] p-4",
        className
      )}
    >
      <div className="h-3 w-1/3 rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-3 h-7 w-1/2 rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-3 h-3 w-3/4 rounded bg-[color:var(--border-subtle)]" />
    </div>
  );
}

// ─── Public skeletons ───────────────────────────────────────────────────────
// Used by (public)/loading.tsx. Shimmer via .public-skeleton in globals.css —
// a calm violet sheen over the deep surface palette. Shared by the Martin and
// FlexTech sites, so these only use theme tokens (no hard-coded brand colors).

/** Single project / blog card skeleton */
export function PublicSkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "overflow-hidden rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-0",
        className
      )}
    >
      {/* Image area */}
      <div className="public-skeleton aspect-[16/10] w-full rounded-b-none" />
      {/* Content */}
      <div className="p-5">
        {/* Badge */}
        <div className="public-skeleton h-4 w-16 rounded-full" />
        {/* Title */}
        <div className="public-skeleton mt-4 h-5 w-3/4 rounded-md" />
        <div className="public-skeleton mt-2 h-5 w-1/2 rounded-md" />
        {/* Description */}
        <div className="public-skeleton mt-4 h-3 w-full rounded" />
        <div className="public-skeleton mt-2 h-3 w-5/6 rounded" />
        {/* Tags */}
        <div className="mt-5 flex gap-2">
          <div className="public-skeleton h-5 w-14 rounded-full" />
          <div className="public-skeleton h-5 w-20 rounded-full" />
          <div className="public-skeleton h-5 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Grid of N card skeletons — mirrors the real featured-projects grid. */
export function PublicSkeletonGrid({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PublicSkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Hero section skeleton — availability chip, circular avatar, headline, CTAs. */
export function PublicSkeletonHero({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 overflow-hidden px-4 pb-12 pt-14 text-center sm:px-6 lg:pb-20 lg:pt-20",
        className
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
  );
}

/** Section skeleton — eyebrow + heading + a grid of card skeletons. */
export function PublicSkeletonSection({
  cardCount = 3,
  className,
}: {
  cardCount?: number;
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("py-16 md:py-20", className)}>
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-10 max-w-3xl space-y-3">
          <div className="public-skeleton h-4 w-20 rounded-full" />
          <div className="public-skeleton h-8 w-2/3 rounded-lg" />
          <div className="public-skeleton h-4 w-1/2 rounded" />
        </div>
        <PublicSkeletonGrid count={cardCount} />
      </div>
    </div>
  );
}
