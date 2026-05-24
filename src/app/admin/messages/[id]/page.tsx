import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactMessageStatusForm } from "@/components/admin/simple-forms";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { Calendar, Clock, Globe, Inbox, Mail, MessageSquare, MessageCircle, Phone, User, ArrowLeft, ExternalLink } from "lucide-react";

type PageProps = { params: Promise<{ id: string }> };

function statusTone(status: string): "neutral" | "success" | "warning" | "accent" {
  if (status === "NEW") return "accent";
  if (status === "REPLIED") return "success";
  if (status === "ARCHIVED") return "warning";
  return "neutral";
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

export default async function MessageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const message = await db.contactMessage.findUnique({ where: { id } });

  if (!message) notFound();

  const mailtoHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.inquiryType ?? "Your message"}`)}`;
  const whatsappHref = message.phone ? `https://wa.me/${message.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="grid gap-8">
      {/* ── Header ── */}
      <div className="flex flex-col gap-5 border-b border-[color:var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.12)] text-[color:var(--primary)]">
              <Inbox size={15} />
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
              Contact Message
            </span>
          </div>
          <h1 className="text-balance font-display text-3xl font-black tracking-normal text-[color:var(--text-strong)] md:text-5xl">
            {message.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-[color:var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <Mail size={14} className="text-[color:var(--text-faint)]" />
              <span className="font-semibold text-[color:var(--text-normal)]">{message.email}</span>
            </span>
            {message.phone ? (
              <>
                <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-[color:var(--text-faint)]" />
                  <span className="font-semibold text-[color:var(--text-normal)]">{message.phone}</span>
                </span>
              </>
            ) : null}
            <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[color:var(--text-faint)]" />
              <span>{formatDate(message.createdAt)}</span>
            </span>
            <span className="hidden text-[color:var(--text-faint)] md:inline">·</span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-[color:var(--text-faint)]" />
              <span>{message.sourcePage ?? "Not tracked"}</span>
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/messages">
              <ArrowLeft size={14} />
              Back to Messages
            </Link>
          </Button>
          <Button asChild size="sm">
            <a href={mailtoHref}>
              <Mail size={14} />
              Reply by Email
            </a>
          </Button>
          <DeleteButton endpoint={`/api/contact-messages/${message.id}`} redirectTo="/admin/messages" />
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_0.78fr]">
        {/* ── Message card ── */}
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] shadow-[var(--shadow-xs)]">
          {/* Card header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <MessageSquare size={16} className="text-[color:var(--primary)]" />
              </div>
              <div>
                <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">{message.inquiryType ?? "General message"}</h2>
                <p className="text-xs font-semibold text-[color:var(--text-faint)]">
                  {message.name} &middot; {message.email}
                </p>
              </div>
            </div>
            <StatusPill tone={statusTone(message.status)}>{message.status}</StatusPill>
          </div>

          {/* Message body */}
          <div className="p-5">
            <div className="rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-5">
              <p className="whitespace-pre-wrap leading-7 text-[color:var(--text-strong)]">{message.message}</p>
            </div>
          </div>
        </section>

        {/* ── Sidebar ── */}
        <aside className="grid gap-5 self-start">
          {/* Panel 1: Status Management */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <Inbox size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Message Status</h2>
            </div>
            <ContactMessageStatusForm message={message} />
          </div>

          {/* Panel 2: Message Details */}
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(107,38,217,0.1)]">
                <Clock size={14} className="text-[color:var(--primary)]" />
              </div>
              <h2 className="font-display text-base font-black text-[color:var(--text-strong)]">Message Details</h2>
            </div>
            <dl className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <User size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Sender</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{message.name}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Mail size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Email</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{message.email}</dd>
                </div>
              </div>
              {message.phone ? (
                <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                  <Phone size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                  <div className="min-w-0">
                    <dt className="text-xs font-bold text-[color:var(--text-faint)]">Phone</dt>
                    <dd className="truncate font-semibold text-[color:var(--text-strong)]">{message.phone}</dd>
                  </div>
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <MessageSquare size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Inquiry type</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{message.inquiryType ?? "General"}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Calendar size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Received</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{formatDate(message.createdAt)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-[12px] bg-[color:var(--surface-soft)] px-3 py-2.5">
                <Globe size={15} className="shrink-0 text-[color:var(--text-faint)]" />
                <div className="min-w-0">
                  <dt className="text-xs font-bold text-[color:var(--text-faint)]">Source page</dt>
                  <dd className="truncate font-semibold text-[color:var(--text-strong)]">{message.sourcePage ?? "Not tracked"}</dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Panel 3: Quick Follow-up */}
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
                  Email {message.name}
                </a>
              </Button>
              {whatsappHref ? (
                <Button asChild variant="secondary" className="justify-start gap-2">
                  <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                    <MessageCircle size={15} />
                    WhatsApp
                  </a>
                </Button>
              ) : null}
              {message.phone ? (
                <Button asChild variant="secondary" className="justify-start gap-2">
                  <a href={`tel:${message.phone.replace(/\s+/g, "")}`}>
                    <Phone size={15} />
                    Call {message.name}
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
