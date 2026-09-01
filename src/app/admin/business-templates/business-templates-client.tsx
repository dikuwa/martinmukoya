"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Plus, ExternalLink, FileText, ChevronDown, ChevronRight } from "lucide-react";
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

type Template = {
  id: string;
  name: string;
  documentCategory: string;
  active: boolean;
  defaultTone: string;
  defaultStyle: string;
  defaultLength: string;
};

export function BusinessTemplatesClient({ templates }: { templates: Template[] }) {
  // Group templates by category label
  const grouped = new Map<string, Template[]>();
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

  // Category chips for sticky navigation
  const categoryChips = sortedGroups.map(([label]) => label);
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>(["General"]);

  function toggleCategory(label: string) {
    setCollapsedCategories((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label]
    );
  }

  function scrollToCategory(label: string) {
    const element = document.getElementById(`category-${label.replace(/\s+/g, "-").toLowerCase()}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

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

      {/* Sticky category chip row */}
      <div className="sticky top-20 z-10 flex flex-wrap gap-2 px-3 pb-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[color:var(--background)] to-transparent">
        {categoryChips.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => scrollToCategory(label)}
            className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] hover:bg-[color:var(--primary)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]"
          >
            {label}
          </button>
        ))}
      </div>

      {sortedGroups.map(([categoryLabel, groupTemplates]) => {
        const isCollapsed = collapsedCategories.includes(categoryLabel);
        const anchorId = `category-${categoryLabel.replace(/\s+/g, "-").toLowerCase()}`;
        return (
          <div key={categoryLabel} id={anchorId} className="grid gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleCategory(categoryLabel)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-[color:var(--text-faint)] hover:text-[color:var(--text-strong)] transition"
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span>{categoryLabel}</span>
              </button>
            </div>
            {!isCollapsed && (
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
            )}
          </div>
        );
      })}

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