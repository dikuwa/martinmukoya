import { SkeletonChart, SkeletonPageHeader } from "@/components/ui/skeleton-card";

export default function AnalyticsLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonPageHeader />
      <div className="grid gap-5 md:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      <SkeletonChart className="h-72" />
    </div>
  );
}
