import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Plus, ExternalLink, FileText } from "lucide-react";
import type { Prisma, BusinessDocumentType, BusinessDocumentStatus } from "@/generated/prisma/client";
import { Card } from "@/components/ui/card";
import { DashboardSelect } from "@/components/ui/dashboard-select";

type Props = { searchParams: Promise<{ type?: string; status?: string; search?: string }> };

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

const filterClass = "h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";

export default async function BusinessDocumentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const type = params.type || "";
  const status = params.status || "";
  const search = params.search || "";

  const where: Prisma.BusinessDocumentWhereInput = {};
  if (type) where.documentType = type as BusinessDocumentType;
  if (status) where.status = status as BusinessDocumentStatus;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" as const } },
      { documentNumber: { contains: search, mode: "insensitive" as const } },
      { recipientName: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const documents = await db.businessDocument.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { auditLog: true } } },
  });

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

      <Card padding="sm" className="flex flex-wrap gap-2">
        <input name="search" defaultValue={search} placeholder="Search by title, number, recipient…" className={`${filterClass} min-w-64 flex-1`} />
        <DashboardSelect name="type" defaultValue={type || "all"} options={[{ value: "all", label: "All types" }, ...Object.entries(docTypeLabels).map(([value, label]) => ({ value, label }))]} className={filterClass} />
        <DashboardSelect name="status" defaultValue={status || "all"} options={[{ value: "all", label: "All statuses" }, { value: "DRAFT", label: "Draft" }, { value: "ISSUED", label: "Issued" }, { value: "SENT", label: "Sent" }, { value: "VIEWED", label: "Viewed" }, { value: "ACCEPTED", label: "Accepted" }, { value: "DECLINED", label: "Declined" }, { value: "ARCHIVED", label: "Archived" }]} className={filterClass} />
        <button className="rounded-xl bg-[color:var(--primary)] px-4 text-sm font-bold text-white">Filter</button>
        <Link href="/admin/business-documents" className="grid place-items-center rounded-xl px-4 text-sm font-bold">Clear</Link>
      </Card>

      <Card className="overflow-hidden">
        <div className="grid gap-0.5">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={`/admin/business-documents/${doc.id}`}
              className="group grid grid-cols-[1fr_auto] gap-3 border-b border-[color:var(--border-subtle)] px-5 py-4 transition hover:bg-[color:var(--surface-soft)] last:border-0"
            >
              <div className="grid gap-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[color:var(--text-strong)]">{doc.title}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold leading-4 ${statusColors[doc.status] || "bg-gray-100 text-gray-600"}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-muted)]">
                  <span>{docTypeLabels[doc.documentType] || doc.documentType}</span>
                  {doc.documentNumber && <span>{doc.documentNumber}</span>}
                  {doc.recipientName && <span>To: {doc.recipientName}</span>}
                  {doc.issueDate && <span>Issued: {new Date(doc.issueDate).toLocaleDateString("en-GB")}</span>}
                  <span>{new Date(doc.createdAt).toLocaleDateString("en-GB")}</span>
                  <span>{doc._count.auditLog} events</span>
                </div>
              </div>
              <ExternalLink size={15} className="self-center text-[color:var(--text-faint)] transition group-hover:text-[color:var(--text-muted)]" />
            </Link>
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
    </div>
  );
}
