import Link from "next/link";
import type { ReactNode } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { StatusPill } from "@/components/admin/status-pill";
import { ArrowUpRight, BarChart3, Inbox, LayoutDashboard, MessageCircle, MousePointerClick, Newspaper, Rocket, UsersRound } from "lucide-react";

type RecentItem = {
  title: string;
  detail: string;
  href: string;
  status?: string;
  tone?: "neutral" | "success" | "warning" | "accent";
};

function RecentPanel({ title, icon, items, empty }: { title: string; icon: ReactNode; items: RecentItem[]; empty: string }) {
  return (
    <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">{title}</h2>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[color:var(--text-faint)]">{items.length} recent</p>
        </div>
      </div>
      <div className="divide-y divide-[color:var(--border-subtle)] overflow-hidden rounded-[14px] border border-[color:var(--border-subtle)]">
        {items.length === 0 ? (
          <p className="bg-[color:var(--surface)] p-4 text-sm leading-6 text-[color:var(--text-muted)]">
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
    db.chatSession.count({ where: { mode: { in: ["WAITING_FOR_HUMAN", "HUMAN"] } } }),
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
    status: chat.mode === "HUMAN" ? "Human live" : chat.mode === "WAITING_FOR_HUMAN" ? "Waiting" : "AI",
    tone: chat.mode === "HUMAN" ? "success" : "neutral"
  } satisfies RecentItem));

  return (
    <div className="grid gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-5 border-b border-[color:var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]">
              <LayoutDashboard size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
              Admin overview
            </span>
          </div>
          <h1 className="text-balance font-display text-3xl font-black tracking-normal text-[color:var(--text-strong)] md:text-5xl">
            Portfolio operations
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--text-muted)]">
            Manage content, leads, analytics signals, chat handovers, and site settings from one protected workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/admin/projects/new">New Project</Link>
          </Button>
        </div>
      </div>

      {/* ── Snapshot section ── */}
      <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
              <BarChart3 size={14} className="text-[color:var(--primary)]" />
            </div>
            <div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Snapshot</h2>
              <p className="text-xs leading-5 text-[color:var(--text-muted)]">Key signals for content, leads, and conversion intent.</p>
            </div>
          </div>
          <Button asChild size="sm" variant="secondary" className="rounded-[10px]">
            <Link href="/admin/analytics">
              <BarChart3 size={14} />
              View analytics
            </Link>
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

      {/* ── Recent panels ── */}
      <div className="grid gap-5 xl:grid-cols-3">
        <RecentPanel
          title="Recent leads"
          icon={<UsersRound size={14} className="text-[color:var(--primary)]" />}
          items={leadItems}
          empty="No leads have arrived yet."
        />
        <RecentPanel
          title="Recent messages"
          icon={<Inbox size={14} className="text-[color:var(--primary)]" />}
          items={messageItems}
          empty="No contact messages have arrived yet."
        />
        <RecentPanel
          title="Recent chat sessions"
          icon={<MessageCircle size={14} className="text-[color:var(--primary)]" />}
          items={chatItems}
          empty="No AI chat sessions have been recorded yet."
        />
      </div>
    </div>
  );
}
