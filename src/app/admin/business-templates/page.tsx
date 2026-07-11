import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Plus, ExternalLink, FileText } from "lucide-react";

export default async function BusinessTemplatesPage() {
  const templates = await db.businessDocumentTemplate.findMany({ orderBy: { sortOrder: "asc" } });

  const categoryLabels: Record<string, string> = {
    PROPOSAL: "Proposals", SERVICE_AGREEMENT: "Agreements", WEB_DESIGN_CONTRACT: "Contracts",
    MAINTENANCE_AGREEMENT: "Agreements", SCOPE_OF_WORK: "SOW", CHANGE_REQUEST: "Changes",
    PROJECT_HANDOVER: "Handover", BUSINESS_LETTER: "Letters", PAYMENT_REMINDER: "Finance",
    AUDIT_REPORT: "Reports", NDA: "Legal", CUSTOM: "General",
  };

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Document templates"
        description="Manage reusable document templates for proposals, contracts, letters, and reports."
        actions={
          <Button asChild>
            <Link href="/admin/business-templates/new"><Plus size={16} /> New template</Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/admin/business-templates/${tpl.id}/edit`}
            className="group rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 transition hover:bg-[color:var(--surface-soft)]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <FileText size={16} className="text-[color:var(--primary)]" />
              </div>
              <ExternalLink size={15} className="text-[color:var(--text-faint)] opacity-0 transition group-hover:opacity-100" />
            </div>
            <h3 className="mt-3 font-bold">{tpl.name}</h3>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">{categoryLabels[tpl.documentCategory] || tpl.documentCategory}{tpl.active ? "" : " · Inactive"}</p>
            <p className="mt-3 text-xs text-[color:var(--text-faint)]">Tone: {tpl.defaultTone} · Style: {tpl.defaultStyle} · Length: {tpl.defaultLength}</p>
          </Link>
        ))}
      </div>

      {!templates.length && (
        <div className="grid place-items-center gap-4 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-6 py-16 text-center">
          <FileText size={40} className="text-[color:var(--text-faint)]" />
          <p className="text-sm text-[color:var(--text-muted)]">No templates yet. Create your first template.</p>
          <Button asChild><Link href="/admin/business-templates/new">Create template</Link></Button>
        </div>
      )}
    </div>
  );
}
