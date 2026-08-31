import { SkeletonPageHeader, SkeletonTable } from "@/components/ui/skeleton-card";

export default function LeadsLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonPageHeader />
      <SkeletonTable
        rows={8}
        columns={["1.2fr", "0.8fr", "1fr", "0.6fr", "0.6fr", "0.8fr", "1fr"]}
      />
    </div>
  );
}
