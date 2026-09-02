import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { Globe, Plus, Clock, Database, Database as DatabaseIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; site?: string }> };
const PAGE_SIZE = 10;

function settingInitial(key: string) {
  return (key ?? "S").charAt(0).toUpperCase();
}

async function SettingsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const items = await db.siteSetting.findMany({
    where: {
      ...(params.search ? { key: { contains: params.search, mode: "insensitive" as const } } : {}),
      ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {})
    },
    orderBy: { key: "asc" },
    include: { site: true }
  });

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/settings"
        filters={<SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />}
      />
      <AdminTable items={items} empty="No settings found." editHref={(item) => `/admin/settings/${item.id}/edit`} actionLabel="Edit" columns={[
        { header: "Key", cell: (item) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
              {settingInitial(item.key)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-[color:var(--text-strong)]">{item.key}</p>
              <p className="truncate text-xs text-[color:var(--text-muted)]">
                {typeof item.value === "string" ? item.value.slice(0, 60) : JSON.stringify(item.value).slice(0, 60)}
                {(typeof item.value === "string" ? item.value.length : JSON.stringify(item.value).length) > 60 ? "…" : ""}
              </p>
            </div>
          </div>
        ) },
        { header: "Site", cell: (item) => item.site ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(107,38,217,0.08)] px-2.5 py-1 text-xs font-semibold text-[color:var(--primary)]">
            <Globe size={11} />
            {item.site.name}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(107,38,217,0.06)] px-2.5 py-1 text-xs font-semibold text-[color:var(--text-faint)]">
            <Globe size={11} />
            Global
          </span>
        ) },
        { header: "Type", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
            <Database size={14} className="shrink-0 text-[color:var(--text-faint)]" />
            {Array.isArray(item.value) ? "Array" : typeof item.value === "object" && item.value !== null ? "Object" : typeof item.value === "boolean" ? "Boolean" : typeof item.value === "number" ? "Number" : "String"}
          </span>
        ) },
        { header: "Updated", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-[color:var(--text-muted)]">
            <Clock size={13} className="shrink-0 text-[color:var(--text-faint)]" />
            {item.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        ) }
      ]} />
    </>
  );
}

export default function AdminSettingsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Settings"
        description="Manage availability, contact details, social links, and homepage copy."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/documents/settings/document-settings">
                Document settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/settings/new">
                <Plus size={16} />
                New Setting
              </Link>
            </Button>
          </div>
        }
      />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonTable rows={PAGE_SIZE} columns={["2fr", "1fr", "1fr", "0.7fr"]} />}>
          <SettingsTable {...props} />
        </Suspense>
      </ErrorBoundary>
      <div className="rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[color:var(--text-strong)]">Need to back up or clear data?</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Use the Data management page for full backups, selective category deletion, and restores.</p>
          </div>
          <Button asChild variant="secondary"><Link href="/admin/data-management">Go to Data management <DatabaseIcon size={14} /></Link></Button>
        </div>
      </div>
    </div>
  );
}
