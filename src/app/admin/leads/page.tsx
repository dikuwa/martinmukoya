import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LeadStatus, ServiceType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; serviceType?: string; source?: string; page?: string }> };
const PAGE_SIZE = 10;

async function LeadsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const sourceOptions = await db.lead.findMany({ distinct: ["source"], select: { source: true } });
  const where = {
    ...(params.search ? { OR: [{ name: { contains: params.search, mode: "insensitive" as const } }, { email: { contains: params.search, mode: "insensitive" as const } }, { company: { contains: params.search, mode: "insensitive" as const } }, { message: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.status && params.status in LeadStatus ? { status: params.status as LeadStatus } : {}),
    ...(params.serviceType && params.serviceType in ServiceType ? { serviceType: params.serviceType as ServiceType } : {}),
    ...(params.source ? { source: params.source } : {})
  };
  const total = await db.lead.count({ where });
  const items = await db.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        filters={
          <>
            <SelectFilter name="status" label="Status" value={params.status} options={Object.values(LeadStatus).map((status) => ({ label: status, value: status }))} />
            <SelectFilter name="serviceType" label="Service" value={params.serviceType} options={Object.values(ServiceType).map((type) => ({ label: type, value: type }))} />
            <SelectFilter name="source" label="Source" value={params.source} options={sourceOptions.map((item) => ({ label: item.source, value: item.source }))} />
          </>
        }
      />
      <AdminTable items={items} empty="No leads found." editHref={(item) => `/admin/leads/${item.id}`} columns={[
        { header: "Lead", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.name}</p><p className="text-xs text-[color:var(--text-muted)]">{item.email}</p></div> },
        { header: "Service", cell: (item) => item.serviceType },
        { header: "Status", cell: (item) => <StatusPill tone={item.status === "NEW" ? "accent" : item.status === "WON" ? "success" : "neutral"}>{item.status}</StatusPill> },
        { header: "Source", cell: (item) => item.source },
        { header: "Quick contact", cell: (item) => <Button asChild size="sm" variant="secondary"><Link href={`mailto:${item.email}`}>Email</Link></Button> }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/leads" />
    </>
  );
}

export default function AdminLeadsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Leads" description="Review project requests, contact status, notes, and follow-up outcomes." />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <LeadsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
