"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Message = { id: string; role: "VISITOR" | "AI" | "HUMAN" | "SYSTEM"; content: string; senderName?: string | null; createdAt: string };
type Chat = { id: string; mode: "AI" | "WAITING_FOR_HUMAN" | "HUMAN"; messages: Message[]; site?: { slug: string } | null };

export function LiveChatPanel({ initial }: { initial: Chat }) {
  const [chat, setChat] = useState(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const endpoint = `/api/admin/chat-sessions/${initial.id}/live`;
  const refresh = useCallback(async () => {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (response.ok) setChat(await response.json());
  }, [endpoint]);
  useEffect(() => { const timer = setInterval(refresh, 2500); return () => clearInterval(timer); }, [refresh]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [chat.messages.length]);

  async function act(action: "join" | "return-to-ai" | "message") {
    if (action === "message" && !draft.trim()) return;
    setBusy(true);
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...(action === "message" ? { content: draft } : {}) }) });
    if (response.ok) { setChat(await response.json()); setDraft(""); }
    setBusy(false);
  }
  const status = chat.mode === "AI" ? "AI assistant" : chat.mode === "HUMAN" ? "Human live" : "Waiting for human";
  return <Card className="overflow-hidden">
    <header className="flex items-center justify-between border-b border-[color:var(--border-subtle)] p-4">
      <div><h2 className="font-display font-black">Live conversation</h2><p className="text-xs text-[color:var(--text-muted)]">{status} · refreshes automatically</p></div>
      <div className="flex gap-2">
        {chat.mode !== "HUMAN" && <Button size="sm" onClick={() => act("join")} disabled={busy}>Join chat</Button>}
        {chat.mode !== "AI" && <Button size="sm" variant="secondary" onClick={() => act("return-to-ai")} disabled={busy}>Return to AI</Button>}
      </div>
    </header>
    <div className="grid max-h-[560px] gap-3 overflow-y-auto p-5">
      {chat.messages.map(message => <div key={message.id} className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${message.role === "VISITOR" ? "ml-auto bg-[rgba(107,38,217,.12)]" : message.role === "SYSTEM" ? "mx-auto max-w-full bg-[color:var(--surface-soft)] text-center text-xs" : "border border-[color:var(--border-subtle)]"}`}>
        <div className="mb-1 text-xs font-bold text-[color:var(--text-faint)]">{message.role === "VISITOR" ? "Visitor" : message.role === "AI" ? "AI assistant" : message.role === "HUMAN" ? message.senderName ?? "Human" : "System"}</div>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>)}
      <div ref={bottom} />
    </div>
    <form className="flex gap-2 border-t border-[color:var(--border-subtle)] p-4" onSubmit={e => { e.preventDefault(); act("message"); }}>
      <input className="min-w-0 flex-1 rounded-xl border border-[color:var(--border-subtle)] bg-transparent px-4" value={draft} onChange={e => setDraft(e.target.value)} placeholder={chat.mode === "HUMAN" ? "Reply to visitor…" : "Join the chat to reply"} disabled={chat.mode !== "HUMAN" || busy} />
      <Button disabled={chat.mode !== "HUMAN" || busy || !draft.trim()}>Send</Button>
    </form>
  </Card>;
}
