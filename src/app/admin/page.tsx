import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { StatusPill } from "@/components/admin/status-pill";
import { ArrowUpRight, BarChart3, MessageCircle, MousePointerClick, Newspaper, Rocket, UsersRound } from "lucide-react";

type RecentItem = {
  title: string;
  detail: string;
  href: string;
  status?: string;
  tone?: "neutral" | "success" | "warning" | "accent";
};

function RecentPanel({ title, items, empty }: { title: string; items: RecentItem[]; empty: string }) {
  return (
    <section className="rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-xs)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">{title}</h2>
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">{items.length} recent</span>
      </div>
      <div className="mt-4 divide-y divide-[color:var(--border-subtle)] overflow-hidden rounded-[calc(var(--radius)*0.75)] border border-[color:var(--border-subtle)]">
        {items.length === 0 ? (
          <p className="bg-[color:var(--surface)] p-4 text-sm text-[color:var(--text-muted)]">
            {empty}
          </p>
        ) : (
          items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group grid gap-2 bg-[color:var(--surface)] p-4 transition-colors hover:bg-[color:var(--surface-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[color:var(--text-strong)]">{item.title}</p>
                {item.status ? <StatusPill tone={item.tone}>{item.status}</StatusPill> : null}
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="line-clamp-2 text-sm leading-6 text-[color:var(--text-muted)]">{item.detail}</p>
                <ArrowUpRight size={15} className="shrink-0 text-[color:var(--text-faint)] transition group-hover:text-[color:var(--text-muted)]" />
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

export default async function AdminPage() {
  const [newLeads, projects, blogViews, chatHandovers, whatsappClicks, ctaClicks, recentLeads, recentMessages, recentChats] = await Promise.all([
    db.lead.count({ where: { status: "NEW" } }),
    db.project.count({ where: { published: true } }),
    db.analyticsEvent.count({ where: { eventType: "blog_view" } }),
    db.chatSession.count({ where: { handedToHuman: true } }),
    db.analyticsEvent.count({ where: { eventType: "whatsapp_click" } }),
    db.analyticsEvent.count({ where: { eventType: "cta_click" } }),
    db.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, projectGoal: true, status: true, createdAt: true }
    }),
    db.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, inquiryType: true, message: true, status: true }
    }),
    db.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 4,
      include: { lead: true, messages: { take: 1, orderBy: { createdAt: "desc" } } }
    })
  ]);

  const conversionRate = ctaClicks === 0 ? "0%" : `${Math.round((newLeads / ctaClicks) * 100)}%`;
  const leadItems = recentLeads.map((lead) => ({
    title: lead.name,
    detail: lead.projectGoal,
    href: `/admin/leads/${lead.id}`,
    status: lead.status,
    tone: lead.status === "NEW" ? "accent" : lead.status === "WON" ? "success" : lead.status === "LOST" || lead.status === "ARCHIVED" ? "warning" : "neutral"
  } satisfies RecentItem));
  const messageItems = recentMessages.map((message) => ({
    title: message.name,
    detail: `${message.inquiryType ?? "General"} · ${message.message}`,
    href: `/admin/messages/${message.id}`,
    status: message.status,
    tone: message.status === "NEW" ? "accent" : message.status === "REPLIED" ? "success" : message.status === "ARCHIVED" ? "warning" : "neutral"
  } satisfies RecentItem));
  const chatItems = recentChats.map((chat) => ({
    title: chat.lead?.name ?? chat.visitorId ?? "Anonymous visitor",
    detail: chat.summary ?? chat.messages[0]?.content ?? "No summary yet",
    href: `/admin/chat/${chat.id}`,
    status: chat.handedToHuman ? "Handed over" : "Open",
    tone: chat.handedToHuman ? "success" : "neutral"
  } satisfies RecentItem));

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Admin overview"
        title="Portfolio operations"
        description="Manage content, leads, analytics signals, chat handovers, and site settings from one protected workspace."
        actions={
          <Button asChild>
            <Link href="/admin/projects/new">New Project</Link>
          </Button>
        }
      />
      <section className="rounded-[var(--radius)] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-xs)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black text-[color:var(--text-strong)]">Snapshot</h2>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Key signals for content, leads, and conversion intent.</p>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin/analytics">View analytics</Link>
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <StatCard label="New leads" value={String(newLeads)} detail="Awaiting review" visual={<UsersRound size={18} />} />
          <StatCard label="Projects" value={String(projects)} detail="Published" visual={<Rocket size={18} />} />
          <StatCard label="Blog views" value={String(blogViews)} detail="Tracked reads" visual={<Newspaper size={18} />} />
          <StatCard label="Handovers" value={String(chatHandovers)} detail="Chat to human" visual={<MessageCircle size={18} />} />
          <StatCard label="WhatsApp" value={String(whatsappClicks)} detail="Contact intent" visual={<MessageCircle size={18} />} />
          <StatCard label="CTA clicks" value={String(ctaClicks)} detail="Project intent" visual={<MousePointerClick size={18} />} />
          <StatCard label="Conversion" value={conversionRate} detail="Leads / CTA" visual={<BarChart3 size={18} />} />
        </div>
      </section>
      <div className="grid gap-5 xl:grid-cols-3">
        <RecentPanel title="Recent leads" items={leadItems} empty="No leads have arrived yet." />
        <RecentPanel title="Recent messages" items={messageItems} empty="No contact messages have arrived yet." />
        <RecentPanel title="Recent chat sessions" items={chatItems} empty="No AI chat sessions have been recorded yet." />
      </div>
    </div>
  );
}
