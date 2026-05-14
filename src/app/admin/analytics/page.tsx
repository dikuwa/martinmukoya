import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

export default function AdminAnalyticsPage() {
  return (
    <div className="grid gap-8">
      <PageHeader title="Analytics" description="Track traffic sources, CTA clicks, form conversions, and popular content." />
      <EmptyState title="Analytics shell is ready" description="Phase 8 will add PostHog, internal conversion events, and dashboard charts." />
    </div>
  );
}
