import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { LeadStatus, ServiceType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { Globe, Target, Wallet, MessageSquare, Building2, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; serviceType?: string; budget?: string; source?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

const statusStyles: Record<string, "accent" | "success" | "neutral" | "warning"> = {
  NEW: "accent",
  REVIEWING: "neutral",
  CONTACTED: "neutral",
  QUALIFIED: "success",
  WON: "success",
  LOST: "warning",
  ARCHIVED: "warning"
};

function statusTone(status: string): "accent" | "success" | "neutral" | "warning" {
  return statusStyles[status] ?? "neutral";
}

function serviceIcon(type: string) {
  switch (type) {
    case "ECOMMERCE": return <Wallet size={14} className="text-[color:var(--text-faint)]" />;
    case "BOOKING_SYSTEM": return <MessageSquare size={14} className="text-[color:var(--text-faint)]" />;
    case "AI_AUTOMATION": return <Target size={14} className="text-[color:var(--text-faint)]" />;
    default: return <Building2 size={14} className="text-[color:var(--text-faint)]" />;
  }
}

function formatServiceLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function LeadsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const sourceOptions = await db.lead.findMany({ distinct: ["source"], select: { source: true } });
  const budgetOptions = await db.lead.findMany({ distinct: ["budgetRange"], select: { budgetRange: true }, where: { budgetRange: { not: null } } });
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const where = {
    ...(params.search ? { OR: [{ name: { contains: params.search, mode: "insensitive" as const } }, { email: { contains: params.search, mode: "insensitive" as const } }, { phone: { contains: params.search } }, { whatsAppNumber: { contains: params.search } }, { company: { contains: params.search, mode: "insensitive" as const } }, { message: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.status && params.status in LeadStatus ? { status: params.status as LeadStatus } : {}),
    ...(params.serviceType && params.serviceType in ServiceType ? { serviceType: params.serviceType as ServiceType } : {}),
    ...(params.budget ? { budgetRange: params.budget } : {}),
    ...(params.source ? { source: params.source } : {}),
    ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {})
  };
  const total = await db.lead.count({ where });
  const items = await db.lead.findMany({
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
        clearHref="/admin/leads"
        filters={
          <>
            <SelectFilter name="status" label="Status" value={params.status} options={Object.values(LeadStatus).map((status) => ({ label: status, value: status }))} />
            <SelectFilter name="serviceType" label="Service" value={params.serviceType} options={Object.values(ServiceType).map((type) => ({ label: type, value: type }))} />
            <SelectFilter name="budget" label="Budget" value={params.budget} options={budgetOptions.filter((item) => item.budgetRange).map((item) => ({ label: item.budgetRange!, value: item.budgetRange! }))} />
            <SelectFilter name="source" label="Source" value={params.source} options={sourceOptions.map((item) => ({ label: item.source, value: item.source }))} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable items={items} empty="No leads found." editHref={(item) => `/admin/leads/${item.id}`} actionLabel="Open" columns={[
        { header: "Lead", cell: (item) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
              {item.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-[color:var(--text-strong)]">{item.name}</p>
              <p className="truncate text-xs text-[color:var(--text-muted)]">{item.email || item.phone || item.whatsAppNumber || "No contact method"}</p>
              {item.company ? (
                <p className="truncate text-xs text-[color:var(--text-faint)]">{item.company}</p>
              ) : null}
            </div>
          </div>
        )},
        { header: "Site", cell: (item) => item.site ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(107,38,217,0.08)] px-2.5 py-1 text-xs font-semibold text-[color:var(--primary)]">
            <Globe size={12} />
            {item.site.name}
          </span>
        ) : <span className="text-xs text-[color:var(--text-faint)]">—</span> },
        { header: "Service", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
            {serviceIcon(item.serviceType)}
            {formatServiceLabel(item.serviceType)}
          </span>
        )},
        { header: "Budget", cell: (item) => (
          <span className="whitespace-nowrap text-sm font-semibold text-[color:var(--text-normal)]">
            {item.budgetRange ?? <span className="text-xs text-[color:var(--text-faint)]">—</span>}
          </span>
        )},
        { header: "Status", cell: (item) => <StatusPill tone={statusTone(item.status)}>{item.status}</StatusPill> },
        { header: "Source", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm text-[color:var(--text-muted)]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-[5px] bg-[color:var(--surface-soft)] text-[10px] font-bold text-[color:var(--text-faint)] uppercase">
              {item.source.charAt(0)}
            </span>
            {item.source}
          </span>
        )},
        { header: "Quick contact", cell: (item) => (
          item.email ? <Button asChild size="sm" variant="secondary" className="rounded-[10px]">
            <Link href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5">
              <Mail size={13} />
              Email
            </Link>
          </Button> : <span className="text-xs text-[color:var(--text-faint)]">—</span>
        )}
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/leads" />
    </>
  );
}

export default function AdminLeadsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Leads" description="Review project requests, contact status, notes, and follow-up outcomes." actions={<Button asChild><Link href="/admin/leads/new">Create lead</Link></Button>} />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <LeadsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
