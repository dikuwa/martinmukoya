import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function AnalyticsEventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await db.analyticsEvent.findUnique({ where: { id } });

  if (!event) notFound();

  return (
    <div className="grid gap-8">
      <PageHeader
        title={event.eventType}
        description={event.createdAt.toLocaleString()}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/analytics">Back to Analytics</Link>
            </Button>
            <DeleteButton endpoint={`/api/analytics-events/${event.id}`} redirectTo="/admin/analytics" />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[0.75fr_1fr]">
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
          <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">Event context</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Page</dt>
              <dd className="text-[color:var(--text-strong)]">{event.page ?? "Not tracked"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Source</dt>
              <dd className="text-[color:var(--text-strong)]">{event.source ?? "Not tracked"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Device</dt>
              <dd className="text-[color:var(--text-strong)]">{event.device ?? "Not tracked"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Country</dt>
              <dd className="text-[color:var(--text-strong)]">{event.country ?? "Not tracked"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Referrer</dt>
              <dd className="break-all text-[color:var(--text-strong)]">{event.referrer ?? "Not tracked"}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
          <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">Metadata</h2>
          <pre className="mt-5 max-h-[520px] overflow-auto rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-xs leading-6 text-[color:var(--text-muted)]">
            {JSON.stringify(event.metadata ?? {}, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  );
}
