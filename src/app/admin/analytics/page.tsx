import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; source?: string; site?: string; range?: string; page?: string }> };
const PAGE_SIZE = 10;
const rangeOptions = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "All time", value: "all" }
];

type BarItem = { label: string; value: number };

function getRangeStart(range?: string) {
  if (!range || range === "all") return undefined;
  const days = Number(range.replace("d", ""));
  if (!Number.isFinite(days)) return undefined;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function AnalyticsBars({ title, items }: { title: string; items: BarItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
      <h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">{title}</h2>
      <div className="mt-5 grid gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-[color:var(--text-muted)]">No data yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-xs font-bold text-[color:var(--text-muted)]">
                <span className="truncate">{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface-soft)]">
                <div className="h-full rounded-full bg-[color:var(--primary)]" style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function TrendBars({ items }: { items: BarItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)] xl:col-span-2">
      <h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">Conversion trend</h2>
      <div className="mt-5 flex h-32 items-end gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-[8px] bg-[color:var(--primary-light)]" style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }} />
            <span className="w-full truncate text-center text-[10px] font-bold text-[color:var(--text-faint)]">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

async function AnalyticsSummary({ range, site }: { range?: string; site?: string }) {
  const rangeStart = getRangeStart(range);
  const trendStart = rangeStart ?? getRangeStart("30d")!;
  const where: Prisma.AnalyticsEventWhereInput = {
    ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
    ...(site && site !== "all" ? { siteSlug: site } : {})
  };
  const conversionWhere: Prisma.AnalyticsEventWhereInput = {
    createdAt: { gte: trendStart },
    eventType: { in: ["lead_submitted", "contact_message", "ai_handover", "form_submitted", "whatsapp_click"] },
    ...(site && site !== "all" ? { siteSlug: site } : {})
  };
  const [eventTypes, topPages, sources, devices, ctaSources, leadSources] = await Promise.all([
    db.analyticsEvent.groupBy({ by: ["eventType"], where, _count: { _all: true }, orderBy: { _count: { eventType: "desc" } }, take: 5 }),
    db.analyticsEvent.groupBy({ by: ["page"], where: { ...where, page: { not: null } }, _count: { _all: true }, orderBy: { _count: { page: "desc" } }, take: 5 }),
    db.analyticsEvent.groupBy({ by: ["source"], where: { ...where, source: { not: null } }, _count: { _all: true }, orderBy: { _count: { source: "desc" } }, take: 5 }),
    db.analyticsEvent.groupBy({ by: ["device"], where: { ...where, device: { not: null } }, _count: { _all: true }, orderBy: { _count: { device: "desc" } }, take: 5 }),
    db.analyticsEvent.groupBy({
      by: ["source"],
      where: { ...where, source: { not: null }, eventType: { in: ["cta_click", "whatsapp_click", "email_click"] } },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 5
    }),
    db.lead.groupBy({
      by: ["source"],
      where: {
        ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
        ...(site && site !== "all" ? { site: { slug: site } } : {})
      },
      _count: { _all: true },
      orderBy: { _count: { source: "desc" } },
      take: 5
    })
  ]);
  const conversionEvents = await db.analyticsEvent.findMany({
    where: conversionWhere,
    select: { createdAt: true },
    orderBy: { createdAt: "asc" }
  });
  const trend = Array.from({ length: range === "90d" ? 12 : range === "7d" ? 7 : 10 }, (_, index) => {
    const bucket = new Date();
    const span = range === "90d" ? 7 : 1;
    bucket.setDate(bucket.getDate() - (range === "90d" ? (11 - index) * 7 : (range === "7d" ? 6 - index : 9 - index)));
    const label = bucket.toLocaleDateString("en", { month: "short", day: "numeric" });
    const value = conversionEvents.filter((event) => {
      const diff = Math.abs(event.createdAt.getTime() - bucket.getTime());
      return range === "90d" ? diff < span * 24 * 60 * 60 * 1000 : event.createdAt.toDateString() === bucket.toDateString();
    }).length;
    return { label, value };
  });

  return (
    <div className="grid gap-5 xl:grid-cols-4">
      <AnalyticsBars title="Events" items={eventTypes.map((item) => ({ label: item.eventType, value: item._count._all }))} />
      <AnalyticsBars title="Top pages" items={topPages.map((item) => ({ label: item.page ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBars title="Sources" items={sources.map((item) => ({ label: item.source ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBars title="Devices" items={devices.map((item) => ({ label: item.device ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBars title="CTA performance" items={ctaSources.map((item) => ({ label: item.source ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBars title="Lead sources" items={leadSources.map((item) => ({ label: item.source, value: item._count._all }))} />
      <TrendBars items={trend} />
    </div>
  );
}

async function AnalyticsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const eventTypes = await db.analyticsEvent.findMany({ distinct: ["eventType"], select: { eventType: true } });
  const sources = await db.analyticsEvent.findMany({ distinct: ["source"], select: { source: true }, where: { source: { not: null } } });
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const rangeStart = getRangeStart(params.range);
  const where = {
    ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
    ...(params.search ? { OR: [{ eventType: { contains: params.search, mode: "insensitive" as const } }, { page: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.status ? { eventType: params.status } : {}),
    ...(params.source ? { source: params.source } : {}),
    ...(params.site && params.site !== "all" ? { siteSlug: params.site } : {})
  };
  const total = await db.analyticsEvent.count({ where });
  const items = await db.analyticsEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { site: true }
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/analytics"
        filters={
          <>
            <SelectFilter name="status" label="Event" value={params.status} options={eventTypes.map((item) => ({ label: item.eventType, value: item.eventType }))} />
            <SelectFilter name="source" label="Source" value={params.source} options={sources.filter((item) => item.source).map((item) => ({ label: item.source!, value: item.source! }))} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
            <SelectFilter name="range" label="Range" value={params.range} options={rangeOptions} />
          </>
        }
      />
      <AdminTable items={items} empty="No events found." editHref={(item) => `/admin/analytics/${item.id}`} actionLabel="Open" columns={[
        { header: "Event", cell: (item) => <span className="font-bold text-[color:var(--text-strong)]">{item.eventType}</span> },
        { header: "Site", cell: (item) => item.site?.name ?? item.siteSlug ?? "-" },
        { header: "Page", cell: (item) => item.page ?? "-" },
        { header: "Source", cell: (item) => item.source ?? "-" },
        { header: "Device", cell: (item) => item.device ?? "-" },
        { header: "Time", cell: (item) => item.createdAt.toLocaleString() }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/analytics" />
    </>
  );
}

export default function AdminAnalyticsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Analytics" description="Track internal conversion events and popular content." />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <AnalyticsSummaryWrapper {...props} />
          <AnalyticsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

async function AnalyticsSummaryWrapper({ searchParams }: PageProps) {
  const params = await searchParams;
  return <AnalyticsSummary range={params.range} site={params.site} />;
}
