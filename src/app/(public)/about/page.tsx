import { EmptyState } from "@/components/ui/empty-state";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="About page foundation is ready"
        description="Phase 2 will add Martin's business-first story, working style, values, and visual image grid."
      />
    </div>
  );
}
