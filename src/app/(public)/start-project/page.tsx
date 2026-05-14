import { EmptyState } from "@/components/ui/empty-state";

export default function StartProjectPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="Project intake shell is ready"
        description="Phase 5 will add the full multi-step React Hook Form and Zod intake flow for service type, goal, budget, timeline, and contact details."
        actionLabel="Contact Martin"
        actionHref="/contact"
      />
    </div>
  );
}
