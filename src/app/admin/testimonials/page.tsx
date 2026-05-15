import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import Link from "next/link";

type PageProps = { searchParams: Promise<{ search?: string; published?: string; featured?: string; page?: string }> };
const PAGE_SIZE = 10;

export default async function AdminTestimonialsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const where = {
    ...(params.search ? { OR: [{ clientName: { contains: params.search, mode: "insensitive" as const } }, { company: { contains: params.search, mode: "insensitive" as const } }, { quote: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.published ? { published: params.published === "true" } : {}),
    ...(params.featured ? { featured: params.featured === "true" } : {})
  };
  const total = await db.testimonial.count({ where });
  const items = await db.testimonial.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-8">
      <PageHeader title="Testimonials" description="Manage published social proof and featured client quotes." actions={<Button asChild><Link href="/admin/testimonials/new">New Testimonial</Link></Button>} />
      <AdminFilters
        search={params.search}
        filters={
          <>
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="featured" label="Featured" value={params.featured} options={[{ label: "Featured", value: "true" }, { label: "Normal", value: "false" }]} />
          </>
        }
      />
      <AdminTable items={items} empty="No testimonials found." editHref={(item) => `/admin/testimonials/${item.id}/edit`} columns={[
        { header: "Client", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.clientName}</p><p className="text-xs text-[color:var(--text-muted)]">{item.company}</p></div> },
        { header: "Quote", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.quote}</span> },
        { header: "Status", cell: (item) => <StatusPill tone={item.published ? "success" : "warning"}>{item.published ? "Published" : "Draft"}</StatusPill> },
        { header: "Featured", cell: (item) => item.featured ? <StatusPill tone="accent">Featured</StatusPill> : <StatusPill>Normal</StatusPill> }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/testimonials" />
    </div>
  );
}
