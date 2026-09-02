import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { Globe, Star, Plus, Quote, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; published?: string; featured?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

function TestimonialAvatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)]">
        <Image src={image} alt={name} fill className="object-cover" sizes="40px" />
      </div>
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
      {(name ?? "T").charAt(0).toUpperCase()}
    </span>
  );
}

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
        { header: "Client", cell: (item) => (
          <div className="flex items-center gap-3">
            <TestimonialAvatar name={item.clientName} image={item.image} />
            <div className="min-w-0">
              <p className="truncate font-bold text-[color:var(--text-strong)]">{item.clientName}</p>
              <p className="truncate text-xs text-[color:var(--text-muted)]">{item.company ?? "—"}</p>
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
        { header: "Quote", cell: (item) => (
          <span className="inline-flex items-start gap-1.5 line-clamp-2 whitespace-normal text-sm italic leading-relaxed text-[color:var(--text-muted)]">
            <Quote size={14} className="mt-0.5 shrink-0 rotate-180 text-[color:var(--text-faint)]" />
            {item.quote}
          </span>
        ) },
        { header: "Status", cell: (item) => (
          <StatusPill tone={item.published ? "success" : "warning"}>
            {item.published ? "Published" : "Draft"}
          </StatusPill>
        ) },
        { header: "", cell: (item) => item.featured ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--accent)]">
            <Sparkles size={14} />
            Featured
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-faint)]">
            <Star size={14} />
            Standard
          </span>
        ), className: "w-28" }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/testimonials" />
    </>
  );
}

export default function AdminTestimonialsPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader
        title="Testimonials"
        description="Manage published social proof and featured client quotes."
        actions={
          <Button asChild>
            <Link href="/admin/testimonials/new">
              <Plus size={16} />
              New Testimonial
            </Link>
          </Button>
        }
      />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonTable rows={PAGE_SIZE} columns={["1.5fr", "1fr", "2fr", "1fr", "0.5fr", "0.5fr"]} />}>
          <TestimonialsTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
