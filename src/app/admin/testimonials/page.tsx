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

type PageProps = { searchParams: Promise<{ search?: string; published?: string; featured?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

async function TestimonialsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const where = {
    ...(params.search ? { OR: [{ clientName: { contains: params.search, mode: "insensitive" as const } }, { company: { contains: params.search, mode: "insensitive" as const } }, { quote: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.published ? { published: params.published === "true" } : {}),
    ...(params.featured ? { featured: params.featured === "true" } : {}),
    ...(params.site && params.site !== "all" ? { sites: { some: { slug: params.site } } } : {})
  };
  const total = await db.testimonial.count({ where });
  const items = await db.testimonial.findMany({
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
        clearHref="/admin/testimonials"
        filters={
          <>
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="featured" label="Featured" value={params.featured} options={[{ label: "Featured", value: "true" }, { label: "Normal", value: "false" }]} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable items={items} empty="No testimonials found." editHref={(item) => `/admin/testimonials/${item.id}/edit`} actionLabel="Edit" columns={[
        { header: "Client", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.clientName}</p><p className="text-xs text-[color:var(--text-muted)]">{item.company}</p></div> },
        { header: "Sites", cell: (item) => item.sites.map((site) => site.name).join(", ") || "-" },
        { header: "Quote", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.quote}</span> },
        { header: "Status", cell: (item) => <StatusPill tone={item.published ? "success" : "warning"}>{item.published ? "Published" : "Draft"}</StatusPill> },
        { header: "Featured", cell: (item) => item.featured ? <StatusPill tone="accent">Featured</StatusPill> : <StatusPill>Normal</StatusPill> }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/testimonials" />
    </>
  );
}

export default function AdminTestimonialsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Testimonials" description="Manage published social proof and featured client quotes." actions={<Button asChild><Link href="/admin/testimonials/new">New Testimonial</Link></Button>} />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <TestimonialsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
