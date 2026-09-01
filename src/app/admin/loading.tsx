"use client";

import { SkeletonStatCard, SkeletonPageHeader, SkeletonTableRow } from "@/components/ui/skeleton-card";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] grid gap-6">
      <SkeletonPageHeader />
      {/* Stat card row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>
      {/* Table fallback */}
      <div className="rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonTableRow
            key={i}
            columns={["1fr", "1fr", "0.6fr", "0.5fr"]}
            className={i < 4 ? "border-b border-[color:var(--border-subtle)]" : ""}
          />
        ))}
      </div>
    </div>
  );
}
