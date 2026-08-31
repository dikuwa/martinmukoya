import { SkeletonComposer } from "@/components/ui/skeleton-card";

export default function BusinessDocumentEditLoading() {
  return (
    <div className="grid gap-6">
      <SkeletonComposer />
    </div>
  );
}
