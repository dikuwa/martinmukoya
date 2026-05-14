import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminProjectsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Projects" description="Create, publish, feature, reorder, and edit public case studies." />
      <EmptyState title="Project management is ready for CRUD" description="Phase 4 will add the data table, filters, forms, and publish controls." />
    </div>
  );
}
