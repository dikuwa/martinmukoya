import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { LeadStatusForm } from "@/components/admin/simple-forms";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { stripMarkdown } from "@/lib/utils";
import { db } from "@/lib/db";
import { Calendar, Clock, Globe, Mail, MessageSquare, Phone, User, Building2, Target, Wallet, ArrowLeft, ExternalLink, Hash, Users } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

const statusStyles: Record<string, "accent" | "success" | "neutral" | "warning"> = {
  NEW: "accent",
  REVIEWING: "neutral",
  CONTACTED: "neutral",
  QUALIFIED: "success",
  WON: "success",
  LOST: "warning",
  ARCHIVED: "warning"
};

function statusTone(status: string): "accent" | "success" | "neutral" | "warning" {
  return statusStyles[status] ?? "neutral";
}

function serviceIcon(type: string) {
  switch (type) {
    case "ECOMMERCE": return <Wallet size={15} className="text-[color:var(--text-faint)]" />;
    case "BOOKING_SYSTEM": return <Calendar size={15} className="text-[color:var(--text-faint)]" />;
    case "AI_AUTOMATION": return <Target size={15} className="text-[color:var(--text-faint)]" />;
    default: return <Building2 size={15} className="text-[color:var(--text-faint)]" />;
  }
}

function formatServiceLabel(type: string) {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
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

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, include: { chatSessions: true } });
  if (!lead) notFound();

  const mailtoHref = `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.projectGoal.slice(0, 70)}`)}`;
  const whatsappHref = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, "")}` : null;
  const linkedChats = lead.chatSessions;

  return (
    <div className="grid gap-8">
      {/* ── Header with icon metadata ── */}
      <div className="flex flex-col gap-5 border-b border-[color:var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]">
              <Users size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
              Lead
            </span>
          </div>
          <h1 className="text-balance font-display text-3xl font-black tracking-normal text-[color:var(--text-strong)] md:text-5xl">
            {lead.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[color:var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-[color:var(--text-faint)]" />
              <span className="font-semibold text-[color:var(--text-normal)]">{lead.email}</span>
            </span>
            {lead.phone ? (
              <>
                <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[color:var(--text-faint)]" />
                  <span className="font-semibold text-[color:var(--text-normal)]">{lead.phone}</span>
                </span>
              </>
            ) : null}
            <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[color:var(--text-faint)]" />
              <span>{formatDate(lead.createdAt)}</span>
            </span>
            <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-[color:var(--text-faint)]" />
              <span>{lead.source}</span>
            </span>
            {lead.company ? (
              <>
                <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-[color:var(--text-faint)]" />
                  <span className="font-semibold text-[color:var(--text-normal)]">{lead.company}</span>
                </span>
              </>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/leads">
              <ArrowLeft size={14} />
              Back to Leads
            </Link>
          </Button>
          <Button asChild size="sm">
            <a href={mailtoHref}>
              <Mail size={14} />
              Email Lead
            </a>
          </Button>
          <DeleteButton endpoint={`/api/leads/${lead.id}`} redirectTo="/admin/leads" />
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_0.78fr]">
        {/* ── Request details card ── */}
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[var(--shadow-xs)]">
          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <Target size={16} className="text-[color:var(--primary)]" />
              </div>
              <div>
                <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Request details</h2>
                <p className="text-xs font-semibold text-[color:var(--text-faint)]">
                  {formatServiceLabel(lead.serviceType)}
                  {lead.budgetRange ? ` · ${lead.budgetRange}` : ""}
                </p>
              </div>
            </div>
            <StatusPill tone={statusTone(lead.status)}>{lead.status}</StatusPill>
          </div>

          {/* Content */}
          <div className="p-5">
            <dl className="grid gap-4 text-sm">
              {/* Goal */}
              <div className="rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
                <dt className="mb-1 text-xs font-bold text-[color:var(--text-faint)]">Project goal</dt>
                <dd className="leading-7 text-[color:var(--text-strong)]">{lead.projectGoal}</dd>
              </div>

              {/* Message */}
              <div className="rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4">
                <dt className="mb-1 text-xs font-bold text-[color:var(--text-faint)]">Message</dt>
                <dd className="whitespace-pre-wrap leading-7 text-[color:var(--text-strong)]">{stripMarkdown(lead.message ?? "")}</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ── Sidebar ── */}
        <aside className="grid gap-5 self-start">
          {/* Panel 1: Status & Notes */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <Hash size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Status & Notes</h2>
            </div>
            <LeadStatusForm lead={lead} />
          </div>

          {/* Panel 2: Lead Details */}
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <Clock size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Lead Details</h2>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Building2 size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Company</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{lead.company ?? <span className="text-xs text-[color:var(--text-faint)]">Not provided</span>}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                {serviceIcon(lead.serviceType)}
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Service</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{formatServiceLabel(lead.serviceType)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Wallet size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Budget</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{lead.budgetRange ?? <span className="text-xs text-[color:var(--text-faint)]">Not provided</span>}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Calendar size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Timeline</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{lead.timeline ?? <span className="text-xs text-[color:var(--text-faint)]">Not provided</span>}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Mail size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Preferred contact</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{lead.preferredContact}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Globe size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Source</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{lead.source}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Calendar size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Received</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{formatDate(lead.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <User size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Status</dt>
                  <dd>
                    <StatusPill tone={statusTone(lead.status)}>{lead.status}</StatusPill>
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Panel 3: Linked Chat Sessions */}
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <MessageSquare size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Chat Sessions</h2>
            </div>
            {linkedChats.length > 0 ? (
              <div className="grid gap-2">
                {linkedChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/admin/chat/${chat.id}`}
                    className="group flex items-center gap-3 rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-3 transition-colors hover:bg-[color:var(--surface)]"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(107,38,217,0.1)]">
                      <MessageSquare size={14} className="text-[color:var(--primary)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[color:var(--text-strong)]">
                        Chat session
                      </p>
                      <p className="truncate text-xs text-[color:var(--text-faint)]">
                        {formatDate(chat.createdAt)}
                      </p>
                    </div>
                    <span className="text-[color:var(--text-faint)] transition-colors group-hover:text-[color:var(--text-muted)]">
                      <ExternalLink size={13} />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[12px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--surface)]">
                  <MessageSquare size={18} className="text-[color:var(--text-faint)]" />
                </div>
                <p className="text-sm font-semibold text-[color:var(--text-muted)]">No linked chats</p>
                <p className="mt-1 text-xs leading-5 text-[color:var(--text-faint)]">
                  If the visitor started a chat session that led to this lead, it will appear here.
                </p>
              </div>
            )}
          </section>

          {/* Panel 4: Quick Follow-up */}
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <ExternalLink size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Quick Follow-up</h2>
            </div>
            <div className="grid gap-2">
              <Button asChild variant="secondary" className="justify-start gap-2">
                <a href={mailtoHref}>
                  <Mail size={15} />
                  Email {lead.name}
                </a>
              </Button>
              {whatsappHref ? (
                <Button asChild variant="secondary" className="justify-start gap-2">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <Phone size={15} />
                    WhatsApp
                  </a>
                </Button>
              ) : null}
              {lead.phone ? (
                <Button asChild variant="secondary" className="justify-start gap-2">
                  <a href={`tel:${lead.phone.replace(/\s+/g, "")}`}>
                    <Phone size={15} />
                    Call {lead.name}
                  </a>
                </Button>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
