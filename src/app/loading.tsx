import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <div className="mx-auto grid max-w-[1200px] gap-4 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
