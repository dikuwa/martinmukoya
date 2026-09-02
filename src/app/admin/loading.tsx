"use client";

import { SkeletonStatCard, SkeletonPageHeader, SkeletonTable } from "@/components/ui/skeleton-card";

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
      <SkeletonTable rows={5} columns={["1fr", "1fr", "0.6fr", "0.5fr"]} />
    </div>
  );
}
