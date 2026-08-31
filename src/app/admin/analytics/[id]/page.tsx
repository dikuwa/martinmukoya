import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { ArrowLeft, BarChart3, Code, ExternalLink, Globe, Monitor } from "lucide-react";
import { Card } from "@/components/ui/card";

type PageProps = { params: Promise<{ id: string }> };

export default async function AnalyticsEventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await db.analyticsEvent.findUnique({ where: { id } });

  if (!event) notFound();

  return (
    <div className="grid gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]">
              <BarChart3 size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
              Analytics event
            </span>
          </div>
          <h1 className="text-balance font-display text-2xl font-black tracking-normal text-[color:var(--text-strong)] md:text-3xl">
            {event.eventType}
          </h1>
          <p className="mt-1.5 text-base leading-6 text-[color:var(--text-muted)]">
            {event.createdAt.toLocaleString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary" className="rounded-[10px]">
            <Link href="/admin/analytics" className="inline-flex items-center gap-1.5">
              <ArrowLeft size={14} />
              Back
            </Link>
          </Button>
          <DeleteButton endpoint={`/api/analytics-events/${event.id}`} redirectTo="/admin/analytics" />
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        {/* Event Context */}
        <Card padding="md" className="shadow-[var(--shadow-xs)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
              <ExternalLink size={14} className="text-[color:var(--primary)]" />
            </div>
            <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Event context</h2>
          </div>
          <dl className="grid gap-4 text-sm">
            <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
              <dt className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                <span className="inline-flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  Page
                </span>
              </dt>
              <dd className="font-semibold text-[color:var(--text-strong)]">{event.page ?? "Not tracked"}</dd>
            </div>
            <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
              <dt className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={12} />
                  Source
                </span>
              </dt>
              <dd className="font-semibold text-[color:var(--text-strong)]">{event.source ?? "Not tracked"}</dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
                <dt className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Monitor size={12} />
                    Device
                  </span>
                </dt>
                <dd className="font-semibold text-[color:var(--text-strong)]">{event.device ?? "—"}</dd>
              </div>
              <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
                <dt className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe size={12} />
                    Country
                  </span>
                </dt>
                <dd className="font-semibold text-[color:var(--text-strong)]">{event.country ?? "—"}</dd>
              </div>
            </div>
            <div className="rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
              <dt className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">
                <span className="inline-flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  Referrer
                </span>
              </dt>
              <dd className="break-all font-semibold text-[color:var(--text-strong)]">{event.referrer ?? "Not tracked"}</dd>
            </div>
          </dl>
        </Card>

        {/* Metadata */}
        <Card padding="md" className="shadow-[var(--shadow-xs)]">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
              <Code size={14} className="text-[color:var(--primary)]" />
            </div>
            <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Metadata</h2>
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-xs leading-6 text-[color:var(--text-muted)] [scrollbar-width:thin] [scrollbar-color:rgba(196,168,240,0.22)_transparent]">
            {JSON.stringify(event.metadata ?? {}, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
