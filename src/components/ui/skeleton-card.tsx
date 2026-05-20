import { cn } from "@/lib/utils";

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
  return (
    <div className="admin-skeleton h-12 w-full rounded-lg" />
  );
}

export function SkeletonText({ className, width = "full" }: { className?: string; width?: string }) {
  return (
    <div className={cn("admin-skeleton h-4 rounded", className)} style={{ width }} />
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
