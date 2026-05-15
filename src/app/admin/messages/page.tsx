import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ContactMessageStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; category?: string; page?: string }> };
const PAGE_SIZE = 10;

export default async function AdminMessagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const categories = await db.contactMessage.findMany({ distinct: ["inquiryType"], select: { inquiryType: true }, where: { inquiryType: { not: null } } });
  const where = {
    ...(params.search ? { OR: [{ name: { contains: params.search, mode: "insensitive" as const } }, { email: { contains: params.search, mode: "insensitive" as const } }, { message: { contains: params.search, mode: "insensitive" as const } }] } : {}),
    ...(params.status && params.status in ContactMessageStatus ? { status: params.status as ContactMessageStatus } : {}),
    ...(params.category ? { inquiryType: params.category } : {})
  };
  const total = await db.contactMessage.count({ where });
  const items = await db.contactMessage.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-8">
      <PageHeader title="Messages" description="Contact form submissions and direct inquiries." />
      <AdminFilters
        search={params.search}
        filters={
          <>
            <SelectFilter name="status" label="Status" value={params.status} options={Object.values(ContactMessageStatus).map((status) => ({ label: status, value: status }))} />
            <SelectFilter name="category" label="Inquiry type" value={params.category} options={categories.filter((item) => item.inquiryType).map((item) => ({ label: item.inquiryType!, value: item.inquiryType! }))} />
          </>
        }
      />
      <AdminTable items={items} empty="No messages found." columns={[
        { header: "Sender", cell: (item) => <div><p className="font-bold text-[color:var(--text-strong)]">{item.name}</p><p className="text-xs text-[color:var(--text-muted)]">{item.email}</p></div> },
        { header: "Type", cell: (item) => item.inquiryType ?? "General" },
        { header: "Message", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.message}</span> },
        { header: "Status", cell: (item) => <StatusPill tone={item.status === "NEW" ? "accent" : "neutral"}>{item.status}</StatusPill> },
        { header: "Reply", cell: (item) => <Button asChild size="sm" variant="secondary"><a href={`mailto:${item.email}`}>Email</a></Button> }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/messages" />
    </div>
  );
}
