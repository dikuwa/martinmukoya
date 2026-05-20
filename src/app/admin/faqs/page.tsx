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

type PageProps = { searchParams: Promise<{ search?: string; category?: string; published?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

async function FaqsTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const where = {
    ...(params.search ? { OR: [{ question: { contains: params.search, mode: "insensitive" as const } }, { answer: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.published ? { published: params.published === "true" } : {}),
    ...(params.site && params.site !== "all" ? { sites: { some: { slug: params.site } } } : {})
  };
  const total = await db.fAQ.count({ where });
  const items = await db.fAQ.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { sites: true }
  });
  const categories = await db.fAQ.findMany({ distinct: ["category"], select: { category: true }, where: { category: { not: null } } });
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/faqs"
        filters={
          <>
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="category" label="Category" value={params.category} options={categories.filter((item) => item.category).map((item) => ({ label: item.category!, value: item.category! }))} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable items={items} empty="No FAQs found." editHref={(item) => `/admin/faqs/${item.id}/edit`} actionLabel="Edit" columns={[
        { header: "Question", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.question}</p><p className="text-xs text-[color:var(--text-muted)]">{item.category}</p></div> },
        { header: "Sites", cell: (item) => item.sites.map((site) => site.name).join(", ") || "-" },
        { header: "Answer", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.answer}</span> },
        { header: "Status", cell: (item) => <StatusPill tone={item.published ? "success" : "warning"}>{item.published ? "Published" : "Draft"}</StatusPill> }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/faqs" />
    </>
  );
}

export default function AdminFaqsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="FAQs" description="Edit pricing, process, support, hosting, AI, and ecommerce answers." actions={<Button asChild><Link href="/admin/faqs/new">New FAQ</Link></Button>} />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <FaqsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
