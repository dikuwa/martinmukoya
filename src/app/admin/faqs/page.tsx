import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminFaqsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="FAQs" description="Edit pricing, process, support, hosting, AI, and ecommerce answers." />
      <EmptyState title="FAQ manager is ready" description="Phase 4 will add sorting, publishing, and edit controls." />
    </div>
  );
}
