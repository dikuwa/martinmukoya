import Link from "next/link";
import { notFound } from "next/navigation";
import { LiveChatPanel } from "@/components/admin/live-chat-panel";
import { ChatSessionStatusForm } from "@/components/admin/simple-forms";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export default async function ChatSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.chatSession.findUnique({ where: { id }, include: { site: true, lead: true, messages: { orderBy: { createdAt: "asc" } } } });
  if (!session) notFound();
  const initial = JSON.parse(JSON.stringify(session));
  return <div className="grid gap-7">
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--border-subtle)] pb-6">
      <div><p className="text-xs font-bold uppercase tracking-wider text-[color:var(--text-faint)]">{session.site?.name ?? "Website"}</p><h1 className="font-display text-4xl font-black">Chat session</h1><p className="mt-2 text-sm text-[color:var(--text-muted)]">{session.visitorId ?? "Anonymous visitor"} · {session.createdAt.toLocaleString()}</p></div>
      <div className="flex gap-2"><Button asChild variant="secondary" size="sm"><Link href="/admin/chat">Back to chats</Link></Button><DeleteButton endpoint={`/api/chat-sessions/${id}`} redirectTo="/admin/chat" /></div>
    </header>
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <LiveChatPanel initial={initial} />
      <aside className="grid content-start gap-5"><ChatSessionStatusForm session={session} />{session.lead && <Button asChild><Link href={`/admin/leads/${session.lead.id}`}>Open linked lead</Link></Button>}</aside>
    </div>
  </div>;
}
