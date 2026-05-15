import { AdminTable } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { searchParams: Promise<{ page?: string }> };
const PAGE_SIZE = 10;

export default async function AdminChatPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const total = await db.chatSession.count();
  const items = await db.chatSession.findMany({
    include: { lead: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-8">
      <PageHeader title="Chat" description="Review AI assistant sessions, summaries, and human handovers." />
      <AdminTable items={items} empty="No chat sessions yet." columns={[
        { header: "Visitor", cell: (item) => item.visitorId ?? "Anonymous" },
        { header: "Summary", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.summary ?? item.messages[0]?.content ?? "No summary yet"}</span> },
        { header: "Lead", cell: (item) => item.lead?.name ?? "-" },
        { header: "Handover", cell: (item) => item.handedToHuman ? <StatusPill tone="success">Handed over</StatusPill> : <StatusPill>Open</StatusPill> },
        { header: "Created", cell: (item) => item.createdAt.toLocaleDateString() }
      ]} />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/chat" />
    </div>
  );
}
