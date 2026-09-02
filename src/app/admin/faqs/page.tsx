import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { Globe, FileQuestion, Plus, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; category?: string; published?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

function faqInitial(question: string) {
  return (question ?? "F").charAt(0).toUpperCase();
}

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
        { header: "Question", cell: (item) => (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
              {faqInitial(item.question)}
            </span>
            <div className="min-w-0">
              <p className="line-clamp-1 font-bold text-[color:var(--text-strong)]">{item.question}</p>
              {item.category ? <p className="text-xs text-[color:var(--text-muted)]">{item.category}</p> : null}
            </div>
          </div>
        ) },
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
        { header: "Answer", cell: (item) => (
          <span className="inline-flex items-start gap-1.5 line-clamp-2 whitespace-normal text-sm text-[color:var(--text-muted)]">
            <HelpCircle size={14} className="mt-0.5 shrink-0 text-[color:var(--text-faint)]" />
            {item.answer}
          </span>
        ) },
        { header: "Status", cell: (item) => (
          <StatusPill tone={item.published ? "success" : "warning"}>
            {item.published ? "Published" : "Draft"}
          </StatusPill>
        ) },
        { header: "Order", cell: (item) => (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
            <FileQuestion size={14} className="shrink-0 text-[color:var(--text-faint)]" />
            #{item.sortOrder}
          </span>
        ) }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/faqs" />
    </>
  );
}

export default function AdminFaqsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="FAQs"
        description="Edit pricing, process, support, hosting, AI, and ecommerce answers."
        actions={
          <Button asChild>
            <Link href="/admin/faqs/new">
              <Plus size={16} />
              New FAQ
            </Link>
          </Button>
        }
      />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonTable rows={PAGE_SIZE} columns={["1.5fr", "1fr", "2fr", "1fr", "0.5fr"]} />}>
          <FaqsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
