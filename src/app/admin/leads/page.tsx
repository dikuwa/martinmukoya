import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminLeadsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Leads" description="Review project requests, contact status, notes, and follow-up outcomes." />
      <EmptyState title="Lead inbox is waiting for submissions" description="Phase 5 will connect forms, statuses, notes, and notifications." />
    </div>
  );
}
