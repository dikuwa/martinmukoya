import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Plus, ExternalLink, FileText, Download, Share2 } from "lucide-react";
import { BusinessDocumentType, BusinessDocumentStatus } from "@/generated/prisma/client";
import type { Prisma } from "@/generated/prisma/client";
import { Card } from "@/components/ui/card";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { DashboardDatePicker } from "@/components/ui/date-picker";
import { requireAdmin } from "@/lib/auth-guard";

type Props = { searchParams: Promise<{ type?: string; status?: string; search?: string; site?: string; from?: string; to?: string; dateField?: string; page?: string; pageSize?: string }> };

const docTypeLabels: Record<string, string> = {
  PROPOSAL: "Proposal", SERVICE_AGREEMENT: "Service Agreement", WEB_DESIGN_CONTRACT: "Web Design Contract",
  MAINTENANCE_AGREEMENT: "Maintenance Agreement", HOSTING_AGREEMENT: "Hosting Agreement", SCOPE_OF_WORK: "Scope of Work",
  PROJECT_BRIEF: "Project Brief", CHANGE_REQUEST: "Change Request", PROJECT_HANDOVER: "Project Handover",
  CLIENT_ACCEPTANCE: "Client Acceptance", BUSINESS_LETTER: "Business Letter", PAYMENT_REMINDER: "Payment Reminder",
  OVERDUE_NOTICE: "Overdue Notice", MEETING_SUMMARY: "Meeting Summary", PROGRESS_REPORT: "Progress Report",
  AUDIT_REPORT: "Audit Report", MAINTENANCE_REPORT: "Maintenance Report", NDA: "NDA / Confidentiality", CUSTOM: "Custom",
};

const statusColors: Record<string, string> = {
  DRAFT: "text-amber-600 bg-amber-50", READY: "text-blue-600 bg-blue-50", ISSUED: "text-green-600 bg-green-50",
  SENT: "text-indigo-600 bg-indigo-50", VIEWED: "text-cyan-600 bg-cyan-50",
  ACCEPTED: "text-emerald-600 bg-emerald-50", DECLINED: "text-red-600 bg-red-50",
  EXPIRED: "text-gray-600 bg-gray-100", SUPERSEDED: "text-purple-600 bg-purple-50",
  REVOKED: "text-orange-600 bg-orange-50", ARCHIVED: "text-gray-500 bg-gray-100",
};

const readableStatus: Record<string, string> = {
  DRAFT: "Draft", READY: "Ready", ISSUED: "Issued", SENT: "Sent", VIEWED: "Viewed",
  ACCEPTED: "Accepted", DECLINED: "Declined", EXPIRED: "Expired", SUPERSEDED: "Superseded",
  REVOKED: "Revoked", ARCHIVED: "Archived",
};

const compactDate = (value: Date | null | undefined) => value
  ? new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
  : "Date not set";

function validDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const filterClass = "h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";

export default async function BusinessDocumentsPage({ searchParams }: Props) {
  const { error } = await requireAdmin();
  if (error) notFound();
  const params = await searchParams;
  const type = Object.values(BusinessDocumentType).includes(params.type as BusinessDocumentType) ? params.type! : "";
  const status = Object.values(BusinessDocumentStatus).includes(params.status as BusinessDocumentStatus) ? params.status! : "";
  const search = params.search || "";
  const site = params.site && params.site !== "all" ? params.site : "";
  const from = validDate(params.from);
  const to = validDate(params.to);
  const dateField = params.dateField === "issued" ? "issued" : "created";
  const requestedPage = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const pageSize = Math.min(50, Math.max(10, Number.parseInt(params.pageSize || "20", 10) || 20));

  const where: Prisma.BusinessDocumentWhereInput = {};
  if (type) where.documentType = type as BusinessDocumentType;
  if (status) where.status = status as BusinessDocumentStatus;
  if (site) where.siteId = site;
  if (from || to) {
    if (dateField === "issued") where.issueDate = { gte: from, lte: to };
    else where.createdAt = { gte: from, lte: to };
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" as const } },
      { documentNumber: { contains: search, mode: "insensitive" as const } },
      { recipientName: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const [total, sites] = await Promise.all([
    db.businessDocument.count({ where }),
    db.site.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, pageCount);
  const documents = await db.businessDocument.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { publicShare: true, _count: { select: { auditLog: true } } },
  });
  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (type) query.set("type", type);
  if (status) query.set("status", status);
  if (site) query.set("site", site);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (dateField !== "created") query.set("dateField", dateField);
  if (pageSize !== 20) query.set("pageSize", String(pageSize));
  const pageHref = (nextPage: number) => {
    const next = new URLSearchParams(query);
    if (nextPage > 1) next.set("page", String(nextPage)); else next.delete("page");
    return `/admin/business-documents${next.toString() ? `?${next.toString()}` : ""}`;
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Business documents"
        description="Create proposals, contracts, letters, reports, and official correspondence."
        actions={
          <Button asChild>
            <Link href="/admin/business-documents/new"><Plus size={16} /> New document</Link>
          </Button>
        }
      />

      <Card as="form" method="get" padding="sm" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_repeat(5,minmax(9rem,auto))_auto_auto]">
        <input name="search" defaultValue={search} placeholder="Search by title, number, recipient…" className={`${filterClass} min-w-64 flex-1`} />
        <DashboardSelect name="site" defaultValue={site || "all"} options={[{ value: "all", label: "All identities" }, ...sites.map((item) => ({ value: item.id, label: item.name }))]} className={filterClass} />
        <DashboardSelect name="type" defaultValue={type || "all"} options={[{ value: "all", label: "All types" }, ...Object.entries(docTypeLabels).map(([value, label]) => ({ value, label }))]} className={filterClass} />
        <DashboardSelect name="status" defaultValue={status || "all"} options={[{ value: "all", label: "All statuses" }, ...Object.entries(readableStatus).map(([value, label]) => ({ value, label }))]} className={filterClass} />
        <DashboardSelect name="dateField" defaultValue={dateField} options={[{ value: "created", label: "Creation date" }, { value: "issued", label: "Issue date" }]} className={filterClass} />
        <DashboardDatePicker name="from" value={from} placeholder="From date" />
        <DashboardDatePicker name="to" value={to} placeholder="To date" />
        <button type="submit" className="rounded-xl bg-[color:var(--primary)] px-4 text-sm font-bold text-white">Filter</button>
        <Link href="/admin/business-documents" className="grid place-items-center rounded-xl px-4 text-sm font-bold">Clear</Link>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid gap-0.5">
          {documents.map((doc) => (
            <div key={doc.id} className="group grid grid-cols-[1fr_auto] gap-3 border-b border-[color:var(--border-subtle)] px-5 py-4 transition hover:bg-[color:var(--surface-soft)] last:border-0">
              <Link href={`/admin/business-documents/${doc.id}`} className="grid gap-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[color:var(--text-strong)]">{doc.title}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold leading-4 ${statusColors[doc.status] || "bg-gray-100 text-gray-600"}`}>
                    {readableStatus[doc.status] || doc.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-muted)]">
                  <span>{docTypeLabels[doc.documentType] || doc.documentType}</span>
                  {doc.documentNumber && <span>{doc.documentNumber}</span>}
                  {doc.recipientName && <span>To: {doc.recipientName}</span>}
                  {doc.issueDate && <span>Issued {compactDate(doc.issueDate)}</span>}
                  <span>Created {compactDate(doc.createdAt)}</span>
                  <span>{doc._count.auditLog} events</span>
                </div>
              </Link>
              <div className="flex items-center gap-3 self-center">
                <Link href={`/api/admin/business-documents/${doc.id}/pdf`} aria-label={`Download PDF for ${doc.title}`} title="Download PDF" className="text-[color:var(--text-faint)] hover:text-[color:var(--primary)]"><Download size={15} /></Link>
                {doc.publicShare && <Link href={`/d/${doc.publicShare.shortCode}`} target="_blank" aria-label={`Open shared ${doc.title}`} title="Open shared document" className="text-[color:var(--text-faint)] hover:text-[color:var(--primary)]"><Share2 size={15} /></Link>}
                <ExternalLink size={15} className="text-[color:var(--text-faint)] transition group-hover:text-[color:var(--text-muted)]" />
              </div>
            </div>
          ))}
        </div>
        {!documents.length && (
          <div className="grid place-items-center gap-4 px-6 py-16 text-center">
            <FileText size={40} className="text-[color:var(--text-faint)]" />
            <p className="text-sm text-[color:var(--text-muted)]">No business documents yet. Create your first proposal or contract.</p>
            <Button asChild><Link href="/admin/business-documents/new">Create document</Link></Button>
          </div>
        )}
      </Card>
      {total > 0 && <nav aria-label="Business document pages" className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[color:var(--text-muted)]">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
        <div className="flex gap-2">
          <Link aria-disabled={page <= 1} className={`rounded-lg border px-3 py-2 ${page <= 1 ? "pointer-events-none opacity-40" : ""}`} href={pageHref(Math.max(1, page - 1))}>Previous</Link>
          <Link aria-disabled={page >= pageCount} className={`rounded-lg border px-3 py-2 ${page >= pageCount ? "pointer-events-none opacity-40" : ""}`} href={pageHref(Math.min(pageCount, page + 1))}>Next</Link>
        </div>
      </nav>}
    </div>
  );
}
