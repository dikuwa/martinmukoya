import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; source?: string; page?: string }> };
const PAGE_SIZE = 10;

export default async function AdminAnalyticsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const eventTypes = await db.analyticsEvent.findMany({ distinct: ["eventType"], select: { eventType: true } });
  const sources = await db.analyticsEvent.findMany({ distinct: ["source"], select: { source: true }, where: { source: { not: null } } });
  const where = {
    ...(params.search ? { OR: [{ eventType: { contains: params.search, mode: "insensitive" as const } }, { page: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.status ? { eventType: params.status } : {}),
    ...(params.source ? { source: params.source } : {})
  };
  const total = await db.analyticsEvent.count({ where });
  const items = await db.analyticsEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-8">
      <PageHeader title="Analytics" description="Track internal conversion events and popular content." />
      <AdminFilters
        search={params.search}
        filters={
          <>
            <SelectFilter name="status" label="Event" value={params.status} options={eventTypes.map((item) => ({ label: item.eventType, value: item.eventType }))} />
            <SelectFilter name="source" label="Source" value={params.source} options={sources.filter((item) => item.source).map((item) => ({ label: item.source!, value: item.source! }))} />
          </>
        }
      />
      <AdminTable items={items} empty="No events found." columns={[
        { header: "Event", cell: (item) => <span className="font-bold text-[color:var(--text-strong)]">{item.eventType}</span> },
        { header: "Page", cell: (item) => item.page ?? "-" },
        { header: "Source", cell: (item) => item.source ?? "-" },
        { header: "Device", cell: (item) => item.device ?? "-" },
        { header: "Time", cell: (item) => item.createdAt.toLocaleString() }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/analytics" />
    </div>
  );
}
