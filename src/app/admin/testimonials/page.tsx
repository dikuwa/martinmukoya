import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminTestimonialsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Testimonials" description="Manage published social proof and featured client quotes." />
      <EmptyState title="Testimonials are ready for CRUD" description="Phase 4 will add the management table and form." />
    </div>
  );
}
