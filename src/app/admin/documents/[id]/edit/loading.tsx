import { SkeletonComposer } from "@/components/ui/skeleton-card";

export default function DocumentEditLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonComposer />
    </div>
  );
}
