import { notFound } from "next/navigation";
import { LeadStatusForm } from "@/components/admin/simple-forms";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, include: { chatSessions: true } });
  if (!lead) notFound();
  return (
    <div className="grid gap-8">
      <PageHeader title={lead.name} description={`${lead.email}${lead.phone ? ` · ${lead.phone}` : ""}`} />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
          <h2 className="font-display text-2xl font-black text-[color:var(--text-strong)]">Request details</h2>
          <dl className="mt-5 grid gap-4 text-sm">
            <div><dt className="font-bold text-[color:var(--text-faint)]">Company</dt><dd>{lead.company ?? "Not provided"}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Service</dt><dd>{lead.serviceType}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Budget</dt><dd>{lead.budgetRange ?? "Not provided"}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Timeline</dt><dd>{lead.timeline ?? "Not provided"}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Goal</dt><dd>{lead.projectGoal}</dd></div>
            <div><dt className="font-bold text-[color:var(--text-faint)]">Message</dt><dd>{lead.message}</dd></div>
          </dl>
        </section>
        <LeadStatusForm lead={lead} />
      </div>
    </div>
  );
}
