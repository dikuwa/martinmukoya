import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminSettingsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Settings" description="Manage availability, contact details, social links, and homepage copy." />
      <EmptyState title="Settings page is ready" description="Phase 4 will add editable site settings backed by the database." />
    </div>
  );
}
