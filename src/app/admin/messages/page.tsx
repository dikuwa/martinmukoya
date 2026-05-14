import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminMessagesPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Messages" description="Contact form submissions and direct inquiries." />
      <EmptyState title="Message inbox is ready" description="Phase 5 will store and notify contact submissions." />
    </div>
  );
}
