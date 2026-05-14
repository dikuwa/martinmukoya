import { EmptyState } from "@/components/ui/empty-state";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
      <EmptyState
        title="Service pages are queued for Phase 2"
        description="The shell is in place for web applications, booking systems, ecommerce, and AI automation service pages."
        actionLabel="Book a Call"
        actionHref="/contact"
      />
    </div>
  );
}
