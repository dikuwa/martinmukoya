import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { BarChart3, Globe, Monitor, MousePointerClick, Users, ExternalLink, Calendar } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { BarChartCard, DonutCard, TrendAreaChart } from "@/components/admin/analytics-charts";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; source?: string; site?: string; range?: string; page?: string }> };
const PAGE_SIZE = 10;
const rangeOptions = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
  { label: "All time", value: "all" }
];

function getRangeStart(range?: string) {
  if (!range || range === "all") return undefined;
  const days = Number(range.replace("d", ""));
  if (!Number.isFinite(days)) return undefined;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/** Staggered summary card wrapper — uses the same public-loader-enter pattern. */
function SummaryCard({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div
      className="public-loader-enter"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {children}
    </div>
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
      _count: { _all: true }, orderBy: { _count: { source: "desc" } }, take: 5
    }),
    db.lead.groupBy({
      by: ["source"],
      where: {
        ...(rangeStart ? { createdAt: { gte: rangeStart } } : {}),
        ...(site && site !== "all" ? { site: { slug: site } } : {})
      },
      _count: { _all: true }, orderBy: { _count: { source: "desc" } }, take: 5
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

  // Build a key from the filtered data so recharts replays animations on filter change
  const animKey = `${range ?? "all"}-${site ?? "all"}-${eventTypes.map((e) => e._count._all).join(",")}`;

  const eventData = eventTypes.map((item) => ({ label: item.eventType, value: item._count._all }));
  const pagesData = topPages.map((item) => ({ label: item.page ?? "Unknown", value: item._count._all }));
  const sourcesData = sources.map((item) => ({ label: item.source ?? "Unknown", value: item._count._all }));
  const devicesData = devices.map((item) => ({ label: item.device ?? "Unknown", value: item._count._all }));
  const ctaData = ctaSources.map((item) => ({ label: item.source ?? "Unknown", value: item._count._all }));
  const leadsData = leadSources.map((item) => ({ label: item.source, value: item._count._all }));

  return (
    <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
      <SummaryCard index={0}>
        <BarChartCard title="Events" icon={<BarChart3 size={14} className="text-[color:var(--primary)]" />} items={eventData} animationKey={animKey} />
      </SummaryCard>
      <SummaryCard index={1}>
        <BarChartCard title="Top pages" icon={<ExternalLink size={14} className="text-[color:var(--primary)]" />} items={pagesData} animationKey={animKey} />
      </SummaryCard>
      <SummaryCard index={2}>
        <DonutCard title="Sources" icon={<Globe size={14} className="text-[color:var(--primary)]" />} items={sourcesData} animationKey={animKey} />
      </SummaryCard>
      <SummaryCard index={3}>
        <DonutCard title="Devices" icon={<Monitor size={14} className="text-[color:var(--primary)]" />} items={devicesData} animationKey={animKey} />
      </SummaryCard>
      <SummaryCard index={4}>
        <BarChartCard title="CTA performance" icon={<MousePointerClick size={14} className="text-[color:var(--primary)]" />} items={ctaData} animationKey={animKey} />
      </SummaryCard>
      <SummaryCard index={5}>
        <BarChartCard title="Lead sources" icon={<Users size={14} className="text-[color:var(--primary)]" />} items={leadsData} animationKey={animKey} />
      </SummaryCard>
      <SummaryCard index={6}>
        <TrendAreaChart items={trend} animationKey={animKey} />
      </SummaryCard>
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
