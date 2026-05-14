import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminChatPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Chat" description="Review AI assistant sessions, summaries, and human handovers." />
      <EmptyState title="Chat review is queued" description="Phase 6 will store chat sessions, messages, summaries, and lead handovers." />
    </div>
  );
}
