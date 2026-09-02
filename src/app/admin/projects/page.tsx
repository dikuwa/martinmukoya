import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { Globe, FolderKanban, Plus, Sparkles, Eye } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; published?: string; featured?: string; serviceType?: string; site?: string; page?: string }> };

const SERVICE_OPTIONS = [
  { label: "Web Applications", value: "Web Applications" },
  { label: "Booking Systems", value: "Booking Systems" },
  { label: "E-commerce", value: "E-commerce" },
  { label: "AI Automations & Integrations", value: "AI Automations & Integrations" }
];
const PAGE_SIZE = 10;

function projectInitial(title: string) {
  return (title ?? "P").charAt(0).toUpperCase();
}

async function ProjectsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const where = {
    ...(params.search ? {
      OR: [
        { title: { contains: params.search, mode: "insensitive" as const } },
        { summary: { contains: params.search, mode: "insensitive" as const } },
        { industry: { contains: params.search, mode: "insensitive" as const } }
      ]
    } : {}),
    ...(params.published ? { published: params.published === "true" } : {}),
    ...(params.featured ? { featured: params.featured === "true" } : {}),
    ...(params.serviceType ? { services: { has: params.serviceType } } : {}),
    ...(params.site && params.site !== "all" ? { sites: { some: { slug: params.site } } } : {})
  };
  const total = await db.project.count({ where });
  const items = await db.project.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { sites: true }
  });
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/projects"
        filters={
          <>
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="featured" label="Featured" value={params.featured} options={[{ label: "Featured", value: "true" }, { label: "Normal", value: "false" }]} />
            <SelectFilter name="serviceType" label="Service" value={params.serviceType} options={SERVICE_OPTIONS} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable
        items={items}
        empty="No projects found."
        editHref={(item) => `/admin/projects/${item.id}/edit`}
        actionLabel="Edit"
        columns={[
          { header: "Project", cell: (item) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
                {projectInitial(item.title)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-[color:var(--text-strong)]">{item.title}</p>
                <p className="truncate text-xs text-[color:var(--text-muted)]">{item.slug}</p>
                {item.industry ? <p className="truncate text-xs text-[color:var(--text-faint)]">{item.industry}</p> : null}
              </div>
            </div>
          )},
          { header: "Sites", cell: (item) => item.sites.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.sites.map((site) => (
                <span key={site.slug} className="inline-flex items-center gap-1 rounded-full bg-[rgba(107,38,217,0.08)] px-2.5 py-1 text-xs font-semibold text-[color:var(--primary)]">
                  <Globe size={11} />
                  {site.name}
                </span>
              ))}
            </div>
          ) : <span className="text-xs text-[color:var(--text-faint)]">—</span> },
          { header: "Service", cell: (item) => (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
              <FolderKanban size={14} className="shrink-0 text-[color:var(--text-faint)]" />
              {item.services[0] ?? "General"}
            </span>
          )},
          { header: "Status", cell: (item) => (
            <StatusPill tone={item.published ? "success" : "warning"}>
              {item.published ? "Published" : "Draft"}
            </StatusPill>
          )},
          { header: "", cell: (item) => item.featured ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--accent)]">
              <Sparkles size={14} />
              Featured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-faint)]">
              <Eye size={14} />
              Standard
            </span>
          ), className: "w-28" },
          { header: "Updated", cell: (item) => (
            <span className="whitespace-nowrap text-sm text-[color:var(--text-muted)]">
              {item.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        ]}
      />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/projects" />
    </>
  );
}

export default function AdminProjectsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Projects"
        description="Create, publish, feature, reorder, and edit public case studies."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">
              <Plus size={16} />
              Add Project
            </Link>
          </Button>
        }
      />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonTable rows={PAGE_SIZE} columns={["1.5fr", "1fr", "1fr", "1fr", "0.5fr", "0.7fr", "1fr", "0.8fr"]} />}>
          <ProjectsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
