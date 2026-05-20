import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { ChatSessionStatusForm } from "@/components/admin/simple-forms";
import { StatusPill } from "@/components/admin/status-pill";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ id: string }> };

function roleLabel(role: string) {
  if (role === "USER") return "Visitor";
  if (role === "ASSISTANT") return "Martin AI";
  return "System";
}

export default async function ChatSessionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await db.chatSession.findUnique({
    where: { id },
    include: {
      lead: true,
      messages: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!session) notFound();

  const leadMailtoHref = session.lead
    ? `mailto:${session.lead.email}?subject=${encodeURIComponent(`Re: ${session.lead.projectGoal.slice(0, 70)}`)}`
    : null;
  const leadWhatsappHref = session.lead?.phone ? `https://wa.me/${session.lead.phone.replace(/\D/g, "")}` : null;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Chat session"
        description={`${session.visitorId ?? "Anonymous visitor"} · ${session.createdAt.toLocaleString()}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/admin/chat">Back to Chat</Link>
            </Button>
            {session.lead ? (
              <Button asChild>
                <Link href={`/admin/leads/${session.lead.id}`}>Open Lead</Link>
              </Button>
            ) : null}
            <DeleteButton endpoint={`/api/chat-sessions/${session.id}`} redirectTo="/admin/chat" />
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.78fr]">
        <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--text-faint)]">Transcript</p>
              <h2 className="mt-2 font-display text-2xl font-black text-[color:var(--text-strong)]">
                {session.messages.length} message{session.messages.length === 1 ? "" : "s"}
              </h2>
            </div>
            {session.handedToHuman ? <StatusPill tone="success">Handed over</StatusPill> : <StatusPill>Open</StatusPill>}
          </div>

          <div className="mt-6 grid gap-4">
            {session.messages.length === 0 ? (
              <p className="rounded-[14px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4 text-sm text-[color:var(--text-muted)]">
                No messages were recorded for this session.
              </p>
            ) : (
              session.messages.map((message) => {
                const isVisitor = message.role === "USER";
                return (
                  <article
                    key={message.id}
                    className={cn(
                      "max-w-[86%] rounded-[18px] border p-4 text-sm leading-7",
                      isVisitor
                        ? "ml-auto border-[rgba(107,38,217,0.28)] bg-[rgba(107,38,217,0.12)] text-[color:var(--text-strong)]"
                        : "border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] text-[color:var(--text-strong)]"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-faint)]">
                      <span>{roleLabel(message.role)}</span>
                      <time>{message.createdAt.toLocaleTimeString()}</time>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className="grid gap-5 self-start">
          <ChatSessionStatusForm session={session} />
          <section className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">Session notes</h2>
              {session.handedToHuman ? <StatusPill tone="success">Needs follow-up</StatusPill> : <StatusPill>AI handled</StatusPill>}
            </div>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="font-bold text-[color:var(--text-faint)]">Summary</dt>
                <dd className="mt-1 whitespace-pre-wrap text-[color:var(--text-strong)]">{session.summary ?? "No summary yet."}</dd>
              </div>
              <div>
                <dt className="font-bold text-[color:var(--text-faint)]">Updated</dt>
                <dd className="text-[color:var(--text-strong)]">{session.updatedAt.toLocaleString()}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-3 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5 shadow-[var(--shadow-xs)]">
            <h2 className="font-display text-xl font-black text-[color:var(--text-strong)]">Linked lead</h2>
            {session.lead ? (
              <>
                <div>
                  <p className="font-bold text-[color:var(--text-strong)]">{session.lead.name}</p>
                  <p className="text-sm text-[color:var(--text-muted)]">{session.lead.email}</p>
                </div>
                <Button asChild variant="secondary">
                  <Link href={`/admin/leads/${session.lead.id}`}>View lead</Link>
                </Button>
                {leadMailtoHref ? (
                  <Button asChild variant="secondary">
                    <a href={leadMailtoHref}>Email lead</a>
                  </Button>
                ) : null}
                {leadWhatsappHref ? (
                  <Button asChild variant="secondary">
                    <a href={leadWhatsappHref} target="_blank" rel="noreferrer">WhatsApp</a>
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="text-sm leading-7 text-[color:var(--text-muted)]">
                This conversation is not linked to a lead yet. If the visitor submits the project form from chat, it will appear here.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
