import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ChatSessionStatusForm } from "@/components/admin/simple-forms";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { cn, stripMarkdown } from "@/lib/utils";
import { Bot, MessageCircle, Clock, Calendar, MessageSquare, Globe, Hash, User, Mail, Phone, ExternalLink } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

function roleLabel(role: string) {
  if (role === "USER") return "Visitor";
  if (role === "ASSISTANT") return "Martin AI";
  return "System";
}

function roleIcon(role: string) {
  if (role === "USER") return <User size={14} className="text-[color:var(--text-faint)]" />;
  if (role === "ASSISTANT") return <Bot size={14} className="text-[color:var(--primary)]" />;
  return <Hash size={14} className="text-[color:var(--text-faint)]" />;
}

function sourceLabel() {
  return "Website Chat";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

export default async function ChatSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await db.chatSession.findUnique({
    where: { id },
    include: {
      lead: true,
      site: true,
      messages: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!session) notFound();

  const totalMessages = session.messages.length;
  const sessionStatus = session.handedToHuman ? "Human follow-up" : "AI handled";
  const sessionStatusTone = session.handedToHuman ? "success" : "neutral";
  const visitorName = session.visitorId ?? "Anonymous visitor";

  const leadMailtoHref = session.lead
    ? `mailto:${session.lead.email}?subject=${encodeURIComponent(`Re: ${session.lead.projectGoal.slice(0, 70)}`)}`
    : null;
  const leadWhatsappHref = session.lead?.phone ? `https://wa.me/${session.lead.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="grid gap-8">
      {/* ── Header with icon metadata ── */}
      <div className="flex flex-col gap-5 border-b border-[color:var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]">
              <MessageCircle size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
              Chat Session
            </span>
          </div>
          <h1 className="text-balance font-display text-3xl font-black tracking-normal text-[color:var(--text-strong)] md:text-5xl">
            Chat session
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[color:var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-[color:var(--text-faint)]" />
              <span className="font-semibold text-[color:var(--text-normal)]">{visitorName}</span>
            </span>
            <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[color:var(--text-faint)]" />
              <span>{formatDate(session.createdAt)}</span>
            </span>
            <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-[color:var(--text-faint)]" />
              <span>{sourceLabel()}</span>
            </span>
            {session.site ? (
              <>
                <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-[4px] bg-[rgba(107,38,217,0.12)] text-[10px] font-bold text-[color:var(--primary)]">
                    {session.site.name.charAt(0)}
                  </span>
                  <span>{session.site.name}</span>
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/chat">
              <MessageCircle size={14} />
              Back to Chat
            </Link>
          </Button>
          {session.lead ? (
            <Button asChild size="sm">
              <Link href={`/admin/leads/${session.lead.id}`}>
                <ExternalLink size={14} />
                Open Lead
              </Link>
            </Button>
          ) : null}
          <DeleteButton endpoint={`/api/chat-sessions/${session.id}`} redirectTo="/admin/chat" />
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_0.78fr]">
        {/* ── Conversation card ── */}
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[var(--shadow-xs)]">
          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <MessageSquare size={16} className="text-[color:var(--primary)]" />
              </div>
              <div>
                <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Conversation</h2>
                <p className="text-xs font-semibold text-[color:var(--text-faint)]">
                  {totalMessages} message{totalMessages === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <StatusPill tone={sessionStatusTone as "success" | "neutral"}>{sessionStatus}</StatusPill>
          </div>

          {/* Messages */}
          <div className="grid gap-4 p-5">
            {totalMessages === 0 ? (
              <p className="rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">
                No messages were recorded for this session.
              </p>
            ) : (
              session.messages.map((message) => {
                const isVisitor = message.role === "USER";
                const isAssistant = message.role === "ASSISTANT";
                return (
                  <article
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      isVisitor ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* Avatar column */}
                    <div
                      className={cn(
                        "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isAssistant
                          ? "bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]"
                          : isVisitor
                            ? "bg-[rgba(107,38,217,0.08)] text-[color:var(--text-faint)]"
                            : "bg-[color:var(--surface-soft)] text-[color:var(--text-faint)]"
                      )}
                    >
                      {roleIcon(message.role)}
                    </div>

                    {/* Bubble */}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-7",
                        isVisitor
                          ? "rounded-tr-md bg-[rgba(107,38,217,0.12)]"
                          : isAssistant
                            ? "rounded-tl-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]"
                            : "rounded-tl-md border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)]"
                      )}
                    >
                      {/* Header row */}
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            isVisitor
                              ? "text-[color:var(--primary)]"
                              : "text-[color:var(--text-faint)]"
                          )}
                        >
                          {roleLabel(message.role)}
                        </span>
                        <time className="shrink-0 text-[0.65rem] font-semibold text-[color:var(--text-faint)]">
                          {message.createdAt.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit"
                          })}
                        </time>
                      </div>
                      <p className="whitespace-pre-wrap text-[color:var(--text-strong)]">{stripMarkdown(message.content)}</p>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* ── Right sidebar ── */}
        <aside className="grid gap-5 self-start">
          {/* Panel 1: Session Summary */}
          {/* ChatSessionStatusForm renders its own card styling; we wrap with a plain header above */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <MessageSquare size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Session Summary</h2>
            </div>
            <ChatSessionStatusForm session={session} />
          </div>

          {/* Panel 2: Session Details */}
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <Clock size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Session Details</h2>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Calendar size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Started</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{formatDate(session.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Clock size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Last updated</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{formatDate(session.updatedAt)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <MessageSquare size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Total messages</dt>
                  <dd className="font-semibold text-[color:var(--text-strong)]">{totalMessages}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Globe size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Source</dt>
                  <dd className="font-semibold text-[color:var(--text-strong)]">{sourceLabel()}</dd>
                </div>
              </div>
              {session.site ? (
                <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                  <span className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] bg-[rgba(107,38,217,0.12)] text-[9px] font-bold text-[color:var(--primary)]">
                    {session.site.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-[color:var(--text-faint)]">Site</dt>
                    <dd className="font-semibold text-[color:var(--text-strong)]">{session.site.name}</dd>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Hash size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Status</dt>
                  <dd>
                    <StatusPill tone={sessionStatusTone as "success" | "neutral"}>{sessionStatus}</StatusPill>
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Panel 3: Linked Lead */}
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <User size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Linked Lead</h2>
            </div>
            {session.lead ? (
              <div className="grid gap-3">
                <div className="rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-3.5">
                  <p className="font-bold text-[color:var(--text-strong)]">{session.lead.name}</p>
                  <p className="mt-0.5 text-sm text-[color:var(--text-muted)]">{session.lead.email}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--text-faint)]">
                    <span>Service: <span className="font-semibold text-[color:var(--text-normal)]">{session.lead.serviceType.replace(/_/g, " ")}</span></span>
                    {session.lead.budgetRange ? (
                      <span>Budget: <span className="font-semibold text-[color:var(--text-normal)]">{session.lead.budgetRange}</span></span>
                    ) : null}
                    <span>Status: <StatusPill tone={session.lead.status === "NEW" ? "accent" : session.lead.status === "WON" ? "success" : "neutral"}>{session.lead.status}</StatusPill></span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/leads/${session.lead.id}`}>
                      <ExternalLink size={13} />
                      View Lead
                    </Link>
                  </Button>
                  {leadMailtoHref ? (
                    <Button asChild variant="secondary" size="sm">
                      <a href={leadMailtoHref}>
                        <Mail size={13} />
                        Email
                      </a>
                    </Button>
                  ) : null}
                  {leadWhatsappHref ? (
                    <Button asChild variant="secondary" size="sm">
                      <a href={leadWhatsappHref} target="_blank" rel="noopener noreferrer">
                        <Phone size={13} />
                        WhatsApp
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface)]">
                  <User size={18} className="text-[color:var(--text-faint)]" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--text-muted)]">No linked lead</p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--text-faint)]">
                  If the visitor submits project details through the chatbot, a lead will appear here automatically.
                </p>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
