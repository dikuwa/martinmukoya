import { AdminFilters, AdminTable, SelectFilter } from "@/components/admin/admin-table";
import { AdminPagination } from "@/components/admin/pagination";
import { StatusPill } from "@/components/admin/status-pill";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonTable } from "@/components/ui/skeleton-card";
import { db } from "@/lib/db";
import { stripMarkdown } from "@/lib/utils";
import { Globe, MessageCircle, User } from "lucide-react";
import { Suspense } from "react";

type PageProps = { searchParams: Promise<{ search?: string; status?: string; site?: string; page?: string }> };
const PAGE_SIZE = 10;

function visitorInitial(id: string) {
  return (id ?? "A").charAt(0).toUpperCase();
}

async function ChatTable({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1"));
  const sites = await db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } });
  const where = {
    ...(["AI", "WAITING_FOR_HUMAN", "HUMAN"].includes(params.status ?? "") ? { mode: params.status as "AI" | "WAITING_FOR_HUMAN" | "HUMAN" } : {}),
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
                { label: "AI", value: "AI" },
                { label: "Waiting", value: "WAITING_FOR_HUMAN" },
                { label: "Human live", value: "HUMAN" }
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
          { header: "Visitor", cell: (item) => (
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)] text-xs font-bold text-[color:var(--primary)]">
                {visitorInitial(item.visitorId ?? "A")}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-[color:var(--text-strong)]">{item.visitorId ?? "Anonymous"}</p>
                {item.lead?.name ? (
                  <p className="truncate text-xs text-[color:var(--text-muted)]">Lead: {item.lead.name}</p>
                ) : null}
              </div>
            </div>
          )},
          { header: "Site", cell: (item) => item.site ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(107,38,217,0.08)] px-2.5 py-1 text-xs font-semibold text-[color:var(--primary)]">
              <Globe size={12} />
              {item.site.name}
            </span>
          ) : <span className="text-xs text-[color:var(--text-faint)]">—</span> },
          { header: "Summary", cell: (item) => (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
              <MessageCircle size={14} className="shrink-0 text-[color:var(--text-faint)]" />
              <span className="line-clamp-2 whitespace-normal text-sm text-[color:var(--text-muted)]">
                {stripMarkdown(item.summary ?? item.messages[0]?.content ?? "No summary yet")}
              </span>
            </span>
          )},
          { header: "Lead", cell: (item) => item.lead?.name ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text-normal)]">
              <User size={14} className="shrink-0 text-[color:var(--text-faint)]" />
              {item.lead.name}
            </span>
          ) : <span className="text-xs text-[color:var(--text-faint)]">—</span> },
          { header: "Type", cell: (item) => item.mode === "HUMAN"
            ? <StatusPill tone="success">Human live</StatusPill>
            : item.mode === "WAITING_FOR_HUMAN" ? <StatusPill tone="warning">Waiting</StatusPill> : <StatusPill tone="neutral">AI</StatusPill>
          },
          { header: "Created", cell: (item) => (
            <span className="whitespace-nowrap text-sm text-[color:var(--text-muted)]">
              {item.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          )}
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
        <Suspense fallback={<SkeletonTable rows={PAGE_SIZE} columns={["1.5fr", "1fr", "2fr", "1fr", "1fr", "0.7fr"]} />}>
          <ChatTable {...props} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
