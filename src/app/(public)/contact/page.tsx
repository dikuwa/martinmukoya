import { EmptyState } from "@/components/ui/empty-state";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="Contact flow is ready for forms"
        description="Phase 5 will wire the contact form to validation, Redis rate limiting, database records, and Resend notifications."
        actionLabel="Email Martin"
        actionHref="mailto:info@martinmukoya.com"
      />
    </div>
  );
}
