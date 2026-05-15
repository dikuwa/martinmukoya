import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; published?: string; featured?: string; serviceType?: string; page?: string }> };

const SERVICE_OPTIONS = [
  { label: "Web Applications", value: "Web Applications" },
  { label: "Booking Systems", value: "Booking Systems" },
  { label: "E-commerce", value: "E-commerce" },
  { label: "AI Automations & Integrations", value: "AI Automations & Integrations" }
];
const PAGE_SIZE = 10;

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
    ...(params.serviceType ? { services: { has: params.serviceType } } : {})
  };
  const total = await db.project.count({ where });
  const items = await db.project.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
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
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="featured" label="Featured" value={params.featured} options={[{ label: "Featured", value: "true" }, { label: "Normal", value: "false" }]} />
            <SelectFilter name="serviceType" label="Service" value={params.serviceType} options={SERVICE_OPTIONS} />
          </>
        }
      />
      <AdminTable
        items={items}
        empty="No projects found."
        editHref={(item) => `/admin/projects/${item.id}/edit`}
        columns={[
          { header: "Project", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.title}</p><p className="text-xs text-[color:var(--text-muted)]">{item.slug}</p></div> },
          { header: "Industry", cell: (item) => item.industry ?? "General" },
          { header: "Status", cell: (item) => <StatusPill tone={item.published ? "success" : "warning"}>{item.published ? "Published" : "Draft"}</StatusPill> },
          { header: "Featured", cell: (item) => item.featured ? <StatusPill tone="accent">Featured</StatusPill> : <StatusPill>Normal</StatusPill> }
        ]}
      />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/projects" />
    </>
  );
}

export default function AdminProjectsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Projects" description="Create, publish, feature, reorder, and edit public case studies." actions={<Button asChild><Link href="/admin/projects/new">New Project</Link></Button>} />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <ProjectsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
