import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ContactMessageStatusForm } from "@/components/admin/simple-forms";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

function statusTone(status: string): "neutral" | "success" | "warning" | "accent" {
  if (status === "NEW") return "accent";
  if (status === "REPLIED") return "success";
  if (status === "ARCHIVED") return "warning";
  return "neutral";
}

export default async function MessageDetailPage({ params }: PageProps) {
  const { id } = await params;
  const message = await db.contactMessage.findUnique({ where: { id } });

  if (!message) notFound();

  const mailtoHref = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.inquiryType ?? "Your message"}`)}`;
  const whatsappHref = message.phone ? `https://wa.me/${message.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="grid gap-8">
      <PageHeader
        title={message.name}
        description={`${message.email}${message.phone ? ` · ${message.phone}` : ""}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/messages">Back to Messages</Link>
            </Button>
            <Button asChild>
              <a href={mailtoHref}>Reply by Email</a>
            </Button>
            <DeleteButton endpoint={`/api/contact-messages/${message.id}`} redirectTo="/admin/messages" />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-faint)]">Inquiry</p>
              <h2 className="mt-2 font-display text-2xl font-black text-[color:var(--text-strong)]">{message.inquiryType ?? "General message"}</h2>
            </div>
            <StatusPill tone={statusTone(message.status)}>{message.status}</StatusPill>
          </div>

          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Received</dt>
              <dd className="text-[color:var(--text-strong)]">{message.createdAt.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Source page</dt>
              <dd className="text-[color:var(--text-strong)]">{message.sourcePage ?? "Not tracked"}</dd>
            </div>
            <div>
              <dt className="font-bold text-[color:var(--text-faint)]">Message</dt>
              <dd className="mt-2 whitespace-pre-wrap rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 leading-7 text-[color:var(--text-strong)]">{message.message}</dd>
            </div>
          </dl>
        </section>

        <aside className="grid gap-5 self-start">
          <ContactMessageStatusForm message={message} />
          <section className="grid gap-3 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">Quick follow-up</h2>
            <Button asChild variant="secondary">
              <a href={mailtoHref}>Email {message.name}</a>
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
