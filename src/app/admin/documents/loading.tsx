import { SkeletonPageHeader, SkeletonTable } from "@/components/ui/skeleton-card";

export default function DocumentsLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonPageHeader />
      <SkeletonTable
        rows={6}
        columns={["1fr", "0.8fr", "0.6fr", "0.8fr", "0.5fr"]}
      />
    </div>
  );
}
