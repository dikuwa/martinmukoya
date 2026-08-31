import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { BarChart3, Globe, Monitor, MousePointerClick, TrendingUp, Users, ExternalLink, Calendar } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { Card } from "@/components/ui/card";

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

function AnalyticsBarCard({ title, icon, items }: { title: string; icon: ReactNode; items: BarItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <Card padding="md" className="shadow-[var(--shadow-xs)]">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
          {icon}
        </div>
        <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">{title}</h2>
      </div>
      <div className="grid gap-4">
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
                <div
                  className="h-full rounded-full bg-[color:var(--primary)] transition-all"
                  style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function TrendChart({ items }: { items: BarItem[] }) {
  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <Card padding="md" className="shadow-[var(--shadow-xs)] xl:col-span-2">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
          <TrendingUp size={14} className="text-[color:var(--primary)]" />
        </div>
        <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Conversion trend</h2>
      </div>
      <div className="flex h-32 items-end gap-2">
        {items.map((item) => (
          <div key={item.label} className="group relative flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[6px] bg-gradient-to-t from-[color:var(--primary)] to-[color:var(--primary-light)] transition-all hover:opacity-80"
              style={{ height: `${Math.max(8, (item.value / max) * 100)}%` }}
            />
            <span className="w-full truncate text-center text-[10px] font-bold text-[color:var(--text-faint)]">
              {item.label}
            </span>
            {item.value > 0 && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-[color:var(--text-muted)] opacity-0 transition-opacity group-hover:opacity-100">
                {item.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
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
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      <AnalyticsBarCard title="Events" icon={<BarChart3 size={14} className="text-[color:var(--primary)]" />} items={eventTypes.map((item) => ({ label: item.eventType, value: item._count._all }))} />
      <AnalyticsBarCard title="Top pages" icon={<ExternalLink size={14} className="text-[color:var(--primary)]" />} items={topPages.map((item) => ({ label: item.page ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBarCard title="Sources" icon={<Globe size={14} className="text-[color:var(--primary)]" />} items={sources.map((item) => ({ label: item.source ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBarCard title="Devices" icon={<Monitor size={14} className="text-[color:var(--primary)]" />} items={devices.map((item) => ({ label: item.device ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBarCard title="CTA performance" icon={<MousePointerClick size={14} className="text-[color:var(--primary)]" />} items={ctaSources.map((item) => ({ label: item.source ?? "Unknown", value: item._count._all }))} />
      <AnalyticsBarCard title="Lead sources" icon={<Users size={14} className="text-[color:var(--primary)]" />} items={leadSources.map((item) => ({ label: item.source, value: item._count._all }))} />
      <TrendChart items={trend} />
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
        { header: "Event", cell: (item) => (
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[rgba(107,38,217,0.08)] text-xs font-bold text-[color:var(--primary)]">
              {item.eventType.charAt(0).toUpperCase()}
            </span>
            <span className="font-bold text-[color:var(--text-strong)]">{item.eventType}</span>
          </div>
        ) },
        { header: "Site", cell: (item) => item.site ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(107,38,217,0.08)] px-2.5 py-1 text-xs font-semibold text-[color:var(--primary)]">
            <Globe size={11} />
            {item.site.name}
          </span>
        ) : (
          <span className="text-xs text-[color:var(--text-faint)]">{item.siteSlug ?? "—"}</span>
        ) },
        { header: "Page", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
            <ExternalLink size={13} className="shrink-0 text-[color:var(--text-faint)]" />
            <span className="line-clamp-1">{item.page ?? "—"}</span>
          </span>
        ) },
        { header: "Source", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-muted)]">
            <Globe size={13} className="shrink-0 text-[color:var(--text-faint)]" />
            {item.source ?? "—"}
          </span>
        ) },
        { header: "Device", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-muted)]">
            <Monitor size={13} className="shrink-0 text-[color:var(--text-faint)]" />
            {item.device ?? "—"}
          </span>
        ) },
        { header: "Time", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-[color:var(--text-muted)]">
            <Calendar size={13} className="shrink-0 text-[color:var(--text-faint)]" />
            {item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ) }
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
