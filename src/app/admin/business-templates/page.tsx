import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { Plus, ExternalLink, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const categoryLabels: Record<string, string> = {
  PROPOSAL: "Proposals",
  SERVICE_AGREEMENT: "Agreements",
  WEB_DESIGN_CONTRACT: "Contracts",
  MAINTENANCE_AGREEMENT: "Agreements",
  HOSTING_AGREEMENT: "Agreements",
  SCOPE_OF_WORK: "SOW",
  PROJECT_BRIEF: "Project briefs",
  CHANGE_REQUEST: "Changes",
  PROJECT_HANDOVER: "Handover",
  CLIENT_ACCEPTANCE: "Acceptance",
  BUSINESS_LETTER: "Letters",
  PAYMENT_REMINDER: "Finance",
  OVERDUE_NOTICE: "Finance",
  MEETING_SUMMARY: "Meetings",
  PROGRESS_REPORT: "Reports",
  AUDIT_REPORT: "Reports",
  MAINTENANCE_REPORT: "Reports",
  NDA: "Legal",
  CUSTOM: "General",
};

// Stable sort order for category groups
const categoryOrder = [
  "Proposals", "Contracts", "Agreements", "SOW", "Project briefs",
  "Handover", "Changes", "Acceptance", "Letters", "Finance",
  "Meetings", "Reports", "Legal", "General",
];

export default async function BusinessTemplatesPage() {
  const templates = await db.businessDocumentTemplate.findMany({ orderBy: { sortOrder: "asc" } });

  // Group templates by category label
  const grouped = new Map<string, typeof templates>();
  for (const tpl of templates) {
    const label = categoryLabels[tpl.documentCategory] || tpl.documentCategory;
    const group = grouped.get(label) || [];
    group.push(tpl);
    grouped.set(label, group);
  }

  // Sort groups by defined order
  const sortedGroups = Array.from(grouped.entries()).sort((a, b) => {
    const ai = categoryOrder.indexOf(a[0]);
    const bi = categoryOrder.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

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

      {sortedGroups.map(([categoryLabel, groupTemplates]) => (
        <div key={categoryLabel} className="grid gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--text-faint)]">
            {categoryLabel}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupTemplates.map((tpl) => (
              <Card as={Link} padding="md" className="group transition hover:bg-[color:var(--surface-soft)]" key={tpl.id}
                href={`/admin/business-templates/${tpl.id}/edit`}>
                <div className="flex items-start justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                    <FileText size={16} className="text-[color:var(--primary)]" />
                  </div>
                  <ExternalLink size={15} className="text-[color:var(--text-faint)] opacity-0 transition group-hover:opacity-100" />
                </div>
                <h3 className="mt-3 font-bold">{tpl.name}</h3>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  {tpl.documentCategory.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                  {tpl.active ? "" : " · Inactive"}
                </p>
                <p className="mt-3 text-xs text-[color:var(--text-faint)]">Tone: {tpl.defaultTone} · Style: {tpl.defaultStyle} · Length: {tpl.defaultLength}</p>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {!templates.length && (
        <Card className="grid place-items-center gap-4 px-6 py-16 text-center">
          <FileText size={40} className="text-[color:var(--text-faint)]" />
          <p className="text-sm text-[color:var(--text-muted)]">No templates yet. Create your first template.</p>
          <Button asChild><Link href="/admin/business-templates/new">Create template</Link></Button>
        </Card>
      )}
    </div>
  );
}
