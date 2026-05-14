import { EmptyState } from "@/components/ui/empty-state";

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="Blog foundation is ready"
        description="Phase 2 will add the public blog index. Phase 4 will add the protected editor and management table."
      />
    </div>
  );
}
