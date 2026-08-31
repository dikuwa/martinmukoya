import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

// ─── Admin skeletons ────────────────────────────────────────────────────────
// Used by admin dashboard pages. Shimmer is driven by .admin-skeleton in globals.css.

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card
      padding="md"
      className={cn(
        "admin-skeleton rounded-[var(--radius)]",
        className
      )}
    >
      <div className="aspect-[16/10] rounded-[calc(var(--radius)*0.7)] bg-[color:var(--border-subtle)]" />
      <div className="mt-5 h-4 w-2/3 rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-3 h-3 w-full rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-2 h-3 w-4/5 rounded bg-[color:var(--border-subtle)]" />
    </Card>
  );
}

export function SkeletonRow() {
  return <div className="admin-skeleton h-12 w-full rounded-lg" />;
}

/** Table row skeleton with configurable column widths. */
export function SkeletonTableRow({
  columns = ["1fr", "1fr", "1fr", "0.5fr"],
  className,
}: {
  columns?: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "admin-skeleton flex h-12 w-full items-center gap-4 rounded-lg px-4",
        className
      )}
    >
      {columns.map((w, i) => (
        <div
          key={i}
          className="h-3.5 rounded bg-[color:var(--border-subtle)]"
          style={{ width: w, flexShrink: 0 }}
        />
      ))}
    </div>
  );
}

/** Table header skeleton. */
export function SkeletonTableHeader({
  columns = ["1fr", "1fr", "1fr", "0.5fr"],
  className,
}: {
  columns?: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center gap-4 rounded-lg bg-[color:var(--surface-soft)] px-4",
        className
      )}
    >
      {columns.map((w, i) => (
        <div
          key={i}
          className="admin-skeleton h-3 rounded bg-[color:var(--border-subtle)]"
          style={{ width: w, flexShrink: 0 }}
        />
      ))}
    </div>
  );
}

/** Full table skeleton: header + N rows. */
export function SkeletonTable({
  rows = 5,
  columns = ["1fr", "1fr", "1fr", "0.5fr"],
  className,
}: {
  rows?: number;
  columns?: string[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <SkeletonTableHeader columns={columns} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  );
}

/** Admin page header skeleton: title + subtitle. */
export function SkeletonPageHeader({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="admin-skeleton h-7 w-48 rounded-lg" />
      <div className="admin-skeleton h-4 w-72 rounded" />
    </div>
  );
}

/** Form field skeleton: label + input. */
export function SkeletonFormField({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="admin-skeleton h-3.5 w-24 rounded" />
      <div className="admin-skeleton h-11 w-full rounded-xl" />
    </div>
  );
}

/** Document composer skeleton: form fields left, preview panel right. */
export function SkeletonComposer({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-[1fr_1fr]", className)}>
      {/* Left: form fields */}
      <div className="space-y-5">
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
        <div className="grid grid-cols-2 gap-4">
          <SkeletonFormField />
          <SkeletonFormField />
        </div>
        <SkeletonFormField />
      </div>
      {/* Right: preview panel */}
      <div className="admin-skeleton min-h-[400px] rounded-[var(--radius)] border border-[color:var(--border-subtle)] p-6">
        <div className="space-y-4">
          <div className="h-5 w-1/3 rounded bg-[color:var(--border-subtle)]" />
          <div className="h-3 w-full rounded bg-[color:var(--border-subtle)]" />
          <div className="h-3 w-4/5 rounded bg-[color:var(--border-subtle)]" />
          <div className="mt-6 h-32 w-full rounded bg-[color:var(--border-subtle)]" />
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded bg-[color:var(--border-subtle)]" />
            <div className="h-3 w-24 rounded bg-[color:var(--border-subtle)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Chat skeleton: sidebar list + conversation pane. */
export function SkeletonChatPane({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-5 lg:grid-cols-[280px_1fr]", className)}>
      {/* Sidebar */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "admin-skeleton flex h-14 items-center gap-3 rounded-xl px-3",
              i === 0 && "ring-1 ring-[color:var(--primary)]/30"
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-[color:var(--border-subtle)]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-2/3 rounded bg-[color:var(--border-subtle)]" />
              <div className="h-2.5 w-full rounded bg-[color:var(--border-subtle)]" />
            </div>
          </div>
        ))}
      </div>
      {/* Conversation pane */}
      <div className="flex flex-col rounded-[var(--radius)] border border-[color:var(--border-subtle)] p-5">
        <div className="mb-4 flex items-center gap-3 border-b border-[color:var(--border-subtle)] pb-4">
          <div className="h-8 w-8 rounded-full bg-[color:var(--border-subtle)]" />
          <div className="space-y-1.5">
            <div className="admin-skeleton h-3.5 w-24 rounded" />
            <div className="admin-skeleton h-2.5 w-16 rounded" />
          </div>
        </div>
        <div className="flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <div className={cn(
                "admin-skeleton max-w-[70%] rounded-2xl px-4 py-3",
                i % 2 === 0 ? "rounded-bl-sm" : "rounded-br-sm"
              )}>
                <div className="space-y-1.5">
                  <div className="h-3 w-32 rounded bg-[color:var(--border-subtle)]" />
                  <div className="h-3 w-24 rounded bg-[color:var(--border-subtle)]" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <div className="admin-skeleton h-11 flex-1 rounded-xl" />
          <div className="admin-skeleton h-11 w-11 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/** Chart skeleton: placeholder rectangles sized like real chart panels. */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div className={cn("admin-skeleton rounded-[var(--radius)] p-6", className)}>
      <div className="mb-4 h-4 w-32 rounded bg-[color:var(--border-subtle)]" />
      <div className="flex items-end gap-2" style={{ height: 180 }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-[color:var(--border-subtle)]"
            style={{ height: `${30 + Math.sin(i * 0.8) * 40 + (i % 3) * 7}%` }}
          />
        ))}
      </div>
    </div>
  );
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
    <Card
      padding="sm"
      className={cn(
        "admin-skeleton rounded-[var(--radius)]",
        className
      )}
    >
      <div className="h-3 w-1/3 rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-3 h-7 w-1/2 rounded bg-[color:var(--border-subtle)]" />
      <div className="mt-3 h-3 w-3/4 rounded bg-[color:var(--border-subtle)]" />
    </Card>
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

/** Page hero skeleton — centered eyebrow, big title lines, subtext. */
export function PublicSkeletonPageHeader({
  align = "center",
  className,
}: {
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto w-full max-w-[1200px] px-4 pb-6 pt-12 sm:px-6 lg:pb-8 lg:pt-16",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <div
        className={cn(
          "space-y-3",
          align === "center" ? "mx-auto" : ""
        )}
      >
        <div
          className={cn(
            "public-skeleton h-4 w-24 rounded-full",
            align === "center" ? "mx-auto" : ""
          )}
        />
        <div
          className={cn(
            "public-skeleton h-9 w-3/4 rounded-lg",
            align === "center" ? "mx-auto" : ""
          )}
        />
        <div
          className={cn(
            "public-skeleton h-9 w-1/2 rounded-lg",
            align === "center" ? "mx-auto" : ""
          )}
        />
        <div className={cn("space-y-2 pt-2", align === "center" ? "mx-auto max-w-md" : "max-w-xl")}>
          <div className="public-skeleton h-4 w-full rounded" />
          <div className="public-skeleton h-4 w-3/5 rounded" />
        </div>
      </div>
    </div>
  );
}

/** Blog/listing row skeleton — small thumbnail + title + meta lines. */
export function PublicSkeletonArticleRow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex gap-4 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4",
        className
      )}
    >
      <div className="public-skeleton h-24 w-32 shrink-0 rounded-xl" />
      <div className="flex w-full flex-col justify-center gap-2">
        <div className="public-skeleton h-3 w-24 rounded-full" />
        <div className="public-skeleton h-5 w-3/4 rounded-md" />
        <div className="public-skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}

/** FAQ skeleton — a few accordion-style rows. */
export function PublicSkeletonFaq({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-[16px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5"
        >
          <div className="space-y-2">
            <div className="public-skeleton h-4 w-56 rounded-md" />
            <div className="public-skeleton h-3 w-40 rounded" />
          </div>
          <div className="public-skeleton h-6 w-6 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Contact / start-project skeleton — split two-column (form panel + info). */
export function PublicSkeletonFormSplit({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("grid items-start gap-8 lg:grid-cols-[1fr_0.9fr]", className)}
    >
      {/* Form panel */}
      <div className="rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
        <div className="public-skeleton mb-6 h-7 w-1/2 rounded-lg" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mb-5 space-y-2">
            <div className="public-skeleton h-3 w-20 rounded" />
            <div className={`public-skeleton h-11 w-full rounded-xl`} />
          </div>
        ))}
        <div className="public-skeleton h-12 w-40 rounded-xl" />
      </div>
      {/* Info panel */}
      <div className="space-y-4">
        <div className="rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
          <div className="public-skeleton mb-4 h-5 w-2/3 rounded-md" />
          <div className="public-skeleton h-3 w-full rounded" />
          <div className="public-skeleton mt-2 h-3 w-4/5 rounded" />
        </div>
        <div className="rounded-[22px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6">
          <div className="public-skeleton mb-4 h-5 w-1/2 rounded-md" />
          <div className="space-y-2">
            <div className="public-skeleton h-4 w-3/4 rounded" />
            <div className="public-skeleton h-4 w-2/3 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Plain content block — a few text lines (privacy / terms / documents). */
export function PublicSkeletonText({ head = true, lines = 6, className }: { head?: boolean; lines?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("w-full", className)}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="space-y-3 pb-4">
          <div className="public-skeleton h-9 w-2/3 rounded-lg" />
          {head && <div className="public-skeleton h-8 w-1/2 rounded-lg" />}
        </div>
        <div className="space-y-2.5">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={`public-skeleton h-3 rounded ${
                i === lines - 1 ? "w-2/3" : i % 3 === 2 ? "w-5/6" : "w-full"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
