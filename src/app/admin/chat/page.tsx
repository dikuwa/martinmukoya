import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonCard } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

async function ChatTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const where = {
    ...(params.status === "handover" ? { handedToHuman: true } : {}),
    ...(params.status === "open" ? { handedToHuman: false } : {}),
    ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {}),
    ...(params.search ? {
      OR: [
        { visitorId: { contains: params.search, mode: "insensitive" as const } },
        { summary: { contains: params.search, mode: "insensitive" as const } },
        { lead: { name: { contains: params.search, mode: "insensitive" as const } } },
        { lead: { email: { contains: params.search, mode: "insensitive" as const } } }
      ]
    } : {})
  };
  const total = await db.chatSession.count({ where });
  const items = await db.chatSession.findMany({
    where,
    include: { site: true, lead: true, messages: { take: 1, orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE
  });
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <AdminFilters
        search={params.search}
        clearHref="/admin/chat"
        filters={
          <>
            <SelectFilter
              name="status"
              label="Type"
              value={params.status}
              options={[
                { label: "Internal", value: "open" },
                { label: "Handed", value: "handover" }
              ]}
            />
            <SelectFilter name="site" label="Site" value={params.site} options={[{ label: "All sites", value: "all" }, ...sites.map((site) => ({ label: site.name, value: site.slug }))]} />
          </>
        }
      />
      <AdminTable
        items={items}
        empty="No chat sessions yet."
        editHref={(item) => `/admin/chat/${item.id}`}
        actionLabel="Open"
        columns={[
          { header: "Visitor", cell: (item) => item.visitorId ?? "Anonymous" },
          { header: "Site", cell: (item) => item.site?.name ?? "-" },
          { header: "Summary", cell: (item) => <span className="line-clamp-2 whitespace-normal">{item.summary ?? item.messages[0]?.content ?? "No summary yet"}</span> },
          { header: "Lead", cell: (item) => item.lead?.name ?? "-" },
          { header: "Type", cell: (item) => item.handedToHuman ? <StatusPill tone="success">Handed</StatusPill> : <StatusPill>Internal</StatusPill> },
          { header: "Created", cell: (item) => item.createdAt.toLocaleDateString() }
        ]}
      />
      <AdminPagination page={page} pageCount={pageCount} params={params} basePath="/admin/chat" />
    </>
  );
}

export default function AdminChatPage(props: PageProps) {
  return (
    <div className="grid gap-8">
      <PageHeader title="Chat" description="Review AI assistant sessions, summaries, and human handovers." />
      <ErrorBoundary>
        <Suspense fallback={<SkeletonCard />}>
          <ChatTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
