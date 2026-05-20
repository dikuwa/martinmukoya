import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { ContactMessageStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; category?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

async function MessagesTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const categories = await db.contactMessage.findMany({ distinct: ["inquiryType"], select: { inquiryType: true }, where: { inquiryType: { not: null } } });
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const where = {
    ...(params.search ? { OR: [{ name: { contains: params.search, mode: "insensitive" as const } }, { email: { contains: params.search, mode: "insensitive" as const } }, { message: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.status && params.status in ContactMessageStatus ? { status: params.status as ContactMessageStatus } : {}),
    ...(params.category ? { inquiryType: params.category } : {}),
    ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {})
  };
  const total = await db.contactMessage.count({ where });
  const items = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { site: true }
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/messages"
        filters={
          <>
            <SelectFilter name="status" label="Status" value={params.status} options={Object.values(ContactMessageStatus).map((status) => ({ label: status, value: status }))} />
            <SelectFilter name="category" label="Inquiry type" value={params.category} options={categories.filter((item) => item.inquiryType).map((item) => ({ label: item.inquiryType!, value: item.inquiryType! }))} />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable items={items} empty="No messages found." editHref={(item) => `/admin/messages/${item.id}`} actionLabel="Open" columns={[
        { header: "Sender", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.name}</p><p className="text-xs text-[color:var(--text-muted)]">{item.email}</p></div> },
        { header: "Site", cell: (item) => item.site?.name ?? "-" },
        { header: "Type", cell: (item) => item.inquiryType ?? "General" },
        { header: "Message", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.message}</span> },
        { header: "Status", cell: (item) => <StatusPill tone={item.status === "NEW" ? "accent" : "neutral"}>{item.status}</StatusPill> },
        { header: "Reply", cell: (item) => <Button asChild size="sm" variant="secondary"><a href={`mailto:${item.email}`}>Email</a></Button> }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/messages" />
    </>
  );
}

export default function AdminMessagesPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Messages" description="Contact form submissions and direct inquiries." />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <MessagesTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
