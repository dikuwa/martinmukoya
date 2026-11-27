"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Plus, ExternalLink, FileText, ChevronDown, ChevronRight, Copy, Archive, RotateCcw, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { LiveSearchInput } from "@/components/admin/live-search-input";

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
  defaultBodyMarkdown: string;
  updatedAt: string;
};

export function BusinessTemplatesClient({ templates, search, category, status }: { templates: Template[]; search: string; category: string; status: string }) {
  const router = useRouter();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
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

  async function updateTemplate(id: string, body: Record<string, unknown>) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/business-templates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!response.ok) throw new Error("Template update failed");
      router.refresh();
    } finally { setBusyId(null); }
  }

  async function duplicateTemplate(id: string) {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/business-templates/${id}/duplicate`, { method: "POST" });
      if (!response.ok) throw new Error("Template duplication failed");
      router.refresh();
    } finally { setBusyId(null); }
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

      <form method="get" className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem_10rem_auto]">
        <LiveSearchInput name="search" defaultValue={search} placeholder="Search templates…" aria-label="Search templates" className="h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm" />
        <DashboardSelect name="category" defaultValue={category || "all"} aria-label="Template category" options={[{ value: "all", label: "All categories" }, ...Object.entries(categoryLabels).filter(([value], index, values) => values.findIndex(([key]) => categoryLabels[key] === categoryLabels[value]) === index).map(([value, label]) => ({ value, label }))]} />
        <DashboardSelect name="status" defaultValue={status || "all"} aria-label="Template status" options={[{ value: "all", label: "All templates" }, { value: "active", label: "Active" }, { value: "archived", label: "Archived" }]} />
        <Button type="submit">Filter</Button>
      </form>

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
                  <Card padding="md" className="group transition hover:bg-[color:var(--surface-soft)]" key={tpl.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                        <FileText size={16} className="text-[color:var(--primary)]" />
                      </div>
                      <Link href={`/admin/business-templates/${tpl.id}/edit`} aria-label={`Edit ${tpl.name}`} title="Edit template"><ExternalLink size={15} className="text-[color:var(--text-faint)] transition group-hover:text-[color:var(--primary)]" /></Link>
                    </div>
                    <Link href={`/admin/business-templates/${tpl.id}/edit`} className="mt-3 block font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]">{tpl.name}</Link>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                      {tpl.documentCategory.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                      {tpl.active ? "" : " · Inactive"}
                    </p>
                    <p className="mt-3 text-xs text-[color:var(--text-faint)]">Tone: {tpl.defaultTone} · Style: {tpl.defaultStyle} · Length: {tpl.defaultLength}</p>
                    <p className="mt-1 text-xs text-[color:var(--text-faint)]">Version updated {new Date(tpl.updatedAt).toLocaleDateString("en-GB")}{tpl.active ? "" : " · Archived"}</p>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[color:var(--border-subtle)] pt-3">
                      <button type="button" onClick={() => setPreviewId(previewId === tpl.id ? null : tpl.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-[color:var(--surface-soft)]"><Eye size={13} /> Preview</button>
                      <button type="button" disabled={busyId === tpl.id} onClick={() => void duplicateTemplate(tpl.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-[color:var(--surface-soft)]"><Copy size={13} /> Duplicate</button>
                      <button type="button" disabled={busyId === tpl.id} onClick={() => void updateTemplate(tpl.id, { active: !tpl.active })} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold hover:bg-[color:var(--surface-soft)]">{tpl.active ? <><Archive size={13} /> Archive</> : <><RotateCcw size={13} /> Restore</>}</button>
                    </div>
                    {previewId === tpl.id && <div className="mt-3 rounded-lg bg-[color:var(--surface-soft)] p-3 text-xs leading-5 text-[color:var(--text-muted)]"><p className="mb-1 font-semibold text-[color:var(--text-strong)]">Template preview</p><p className="whitespace-pre-wrap">{tpl.defaultBodyMarkdown || "No default content yet."}</p></div>}
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
