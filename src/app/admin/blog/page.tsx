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

type PageProps = { searchParams: Promise<{ search?: string; published?: string; category?: string; page?: string }> };
const PAGE_SIZE = 10;

async function BlogTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const where = {
    ...(params.search ? { OR: [{ title: { contains: params.search, mode: "insensitive" as const } }, { excerpt: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.published ? { published: params.published === "true" } : {}),
    ...(params.category ? { category: params.category } : {})
  };
  const total = await db.blogPost.count({ where });
  const items = await db.blogPost.findMany({
    where,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const categories = await db.blogPost.findMany({ distinct: ["category"], select: { category: true }, where: { category: { not: null } } });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        filters={
          <>
            <SelectFilter name="published" label="Published" value={params.published} options={[{ label: "Published", value: "true" }, { label: "Draft", value: "false" }]} />
            <SelectFilter name="category" label="Category" value={params.category} options={categories.filter((item) => item.category).map((item) => ({ label: item.category!, value: item.category! }))} />
          </>
        }
      />
      <AdminTable
        items={items}
        empty="No posts found."
        editHref={(item) => `/admin/blog/${item.id}/edit`}
        columns={[
          { header: "Post", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.title}</p><p className="text-xs text-[color:var(--text-muted)]">{item.slug}</p></div> },
          { header: "Category", cell: (item) => item.category ?? "Uncategorized" },
          { header: "Status", cell: (item) => <StatusPill tone={item.published ? "success" : "warning"}>{item.published ? "Published" : "Draft"}</StatusPill> },
          { header: "Updated", cell: (item) => item.updatedAt.toLocaleDateString() }
        ]}
      />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/blog" />
    </>
  );
}

export default function AdminBlogPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Blog" description="Manage SEO posts, drafts, tags, categories, and cover images." actions={<Button asChild><Link href="/admin/blog/new">New Post</Link></Button>} />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <BlogTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
