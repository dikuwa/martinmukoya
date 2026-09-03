import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { Globe, Newspaper, Plus, Clock, Sparkles, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; published?: string; category?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

function postInitial(title: string) {
  return (title ?? "B").charAt(0).toUpperCase();
}

async function BlogTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const where = {
    ...(params.search ? { OR: [{ title: { contains: params.search, mode: "insensitive" as const } }, { excerpt: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.published ? { published: params.published === "true" } : {}),
    ...(params.category ? { category: params.category } : {}),
    ...(params.site && params.site !== "all" ? { sites: { some: { slug: params.site } } } : {})
  };
  const total = await db.blogPost.count({ where });
  const items = await db.blogPost.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { sites: true }
  });
  const categories = await db.blogPost.findMany({ distinct: ["category"], select: { category: true }, where: { category: { not: null } } });
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/blog"
        filters={
          <>
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="category" label="Category" value={params.category} options={categories.filter((item) => item.category).map((item) => ({ label: item.category!, value: item.category! }))} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable
        items={items}
        empty="No posts found."
        editHref={(item) => `/admin/blog/${item.id}/edit`}
        actionLabel="Edit"
        columns={[
          { header: "Post", cell: (item) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius)] bg-[color:var(--surface-soft)]">
                {item.coverImage ? (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    width={36}
                    height={36}
                    className="object-cover object-center rounded-[var(--radius)]"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)] bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
                    {postInitial(item.title)}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-[color:var(--text-strong)]">{item.title}</p>
                <p className="truncate text-xs text-[color:var(--text-muted)]">{item.slug}</p>
                {item.excerpt ? <p className="line-clamp-1 text-xs text-[color:var(--text-faint)]">{item.excerpt}</p> : null}
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
          { header: "Category", cell: (item) => (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
              <Newspaper size={14} className="shrink-0 text-[color:var(--text-faint)]" />
              {item.category ?? "Uncategorized"}
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
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-[color:var(--text-muted)]">
              <Clock size={13} className="shrink-0 text-[color:var(--text-faint)]" />
              {item.updatedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
        ]}
      />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/blog" />
    </>
  );
}

export default function AdminBlogPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Blog"
        description="Manage SEO posts, drafts, tags, categories, and cover images."
        actions={
          <Button asChild>
            <Link href="/admin/blog/new">
              <Plus size={16} />
              New Post
            </Link>
          </Button>
        }
      />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonTable rows={PAGE_SIZE} columns={["1.5fr", "1fr", "1fr", "1fr", "0.7fr"]} />}>
          <BlogTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
