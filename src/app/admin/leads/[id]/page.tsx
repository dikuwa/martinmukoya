import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { LeadStatusForm } from "@/components/admin/simple-forms";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, include: { chatSessions: true } });
  if (!lead) notFound();

  const mailtoHref = `mailto:${lead.email}?subject=${encodeURIComponent(`Re: ${lead.projectGoal.slice(0, 70)}`)}`;
  const whatsappHref = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="grid gap-8">
      <PageHeader
        title={lead.name}
        description={`${lead.email}${lead.phone ? ` · ${lead.phone}` : ""}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/leads">Back to Leads</Link>
            </Button>
            <Button asChild>
              <a href={mailtoHref}>Email Lead</a>
            </Button>
            <DeleteButton endpoint={`/api/leads/${lead.id}`} redirectTo="/admin/leads" />
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-2xl font-black text-[color:var(--text-strong)]">Request details</h2>
            <StatusPill tone={lead.status === "NEW" ? "accent" : lead.status === "WON" ? "success" : lead.status === "LOST" || lead.status === "ARCHIVED" ? "warning" : "neutral"}>{lead.status}</StatusPill>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div><dt className="font-bold text-[color:var(--text-faint)]">Company</dt><dd>{lead.company ?? "Not provided"}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Service</dt><dd>{lead.serviceType}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Budget</dt><dd>{lead.budgetRange ?? "Not provided"}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Timeline</dt><dd>{lead.timeline ?? "Not provided"}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Preferred contact</dt><dd>{lead.preferredContact}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Source</dt><dd>{lead.source}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Received</dt><dd>{lead.createdAt.toLocaleString()}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Goal</dt><dd>{lead.projectGoal}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Message</dt><dd className="mt-2 whitespace-pre-wrap rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 leading-7 text-[color:var(--text-strong)]">{lead.message}</dd></div>
          </dl>
        </section>
        <aside className="grid gap-5 self-start">
          <LeadStatusForm lead={lead} />
          <section className="grid gap-3 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">Quick follow-up</h2>
            <Button asChild variant="secondary">
              <a href={mailtoHref}>Email {lead.name}</a>
            </Button>
            {whatsappHref ? (
              <Button asChild variant="secondary">
                <a href={whatsappHref} target="_blank" rel="noreferrer">WhatsApp</a>
              </Button>
            ) : null}
          </section>
        </aside>
      </div>
    </div>
  );
}
