import { SkeletonPageHeader, SkeletonTableRow } from "@/components/ui/skeleton-card";

export default function BusinessDocumentsLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonPageHeader />
      {/* Filter bar */}
      <div className="flex gap-2">
        <div className="admin-skeleton h-10 w-28 rounded-xl" />
        <div className="admin-skeleton h-10 w-28 rounded-xl" />
        <div className="admin-skeleton h-10 w-28 rounded-xl" />
      </div>
      {/* Document list rows */}
      <div className="rounded-[var(--radius)] border border-[color:var(--border-subtle)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonTableRow
            key={i}
            columns={["1.2fr", "0.8fr", "0.6fr", "0.5fr"]}
            className={i < 5 ? "border-b border-[color:var(--border-subtle)]" : ""}
          />
        ))}
      </div>
    </div>
  );
}
