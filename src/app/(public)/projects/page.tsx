import { EmptyState } from "@/components/ui/empty-state";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="Project gallery is ready for content"
        description="Phase 2 will add filterable case study cards, project images, tech tags, live links, and business outcome summaries."
        actionLabel="Start Project"
        actionHref="/start-project"
      />
    </div>
  );
}
