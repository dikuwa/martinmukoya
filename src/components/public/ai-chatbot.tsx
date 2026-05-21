"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";

const whatsappHref = "https://wa.me/264818563005";

function siteAwareGreeting(slug: string) {
  if (slug === "flextech-media") {
    return {
      title: "Campaign assistant",
      subtitle: "Fast guidance before handoff",
      initial: "👋 Hi! I'm the FlexTech project assistant. I can help you understand our services, shape a campaign brief, or find the fastest way to speak with the team.",
      humanLabel: "Team"
    };
  }
  return {
    title: "Project assistant",
    subtitle: "Fast guidance before handoff",
    initial: "👋 Hi! I can help you choose a service, shape a brief, or find the quickest way to reach Martin.",
    humanLabel: "Human"
  };
}

export function AIChatbot({ siteSlug = "martin-mukoya" }: { siteSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: number; author: string; text: string; time: string }>>(() => [
    { id: 1, author: "AI", text: siteAwareGreeting(siteSlug).initial, time: "Now" }
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const siteSlugRef = useRef(siteSlug);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIdRef = useRef(2);
  const hasConversationStarted = messages.length > 1;

  const greeting = useMemo(() => siteAwareGreeting(siteSlug), [siteSlug]);
  const humanLabel = greeting.humanLabel;

  const quickReplies = useMemo(
    () => [
      "Choose a service",
      "Project timeline",
      "Budget guidance",
      `Talk to ${humanLabel}`
    ],
    [humanLabel]
  );

  function adjustTextareaHeight(target: HTMLTextAreaElement) {
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 168)}px`;
  }

  async function handleSend(content: string) {
    if (!content.trim() || loading) return;

    const userMessageId = messageIdRef.current++;
    const userMessage = {
      id: userMessageId,
      author: "You",
      text: content,
      time: "Now"
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    // add a placeholder assistant message we will stream into
    const aiMessageId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      { id: aiMessageId, author: "AI", text: "", time: "Now" }
    ]);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sessionId, siteSlug: siteSlugRef.current })
      });

      if (!res.body) throw new Error("No response body");
      const nextSessionId = res.headers.get("X-Chat-Session-Id");
      if (nextSessionId) {
        setSessionId(nextSessionId);
      }

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "The AI assistant is temporarily unavailable.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (value) {
          const chunk = decoder.decode(value);
          setMessages((current) =>
            current.map((m) => (m.id === aiMessageId ? { ...m, text: m.text + chunk } : m))
          );
        }
      }
    } catch (err) {
      console.error("chat error", err);
      setMessages((current) =>
        current.map((m) => (m.id === aiMessageId ? { ...m, text: err instanceof Error ? err.message : "The AI assistant is temporarily unavailable." } : m))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight(textareaRef.current);
    }
  }, [draft, open]);

  useEffect(() => {
    if (!open) return;

    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth"
    });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3 lg:bottom-6">
      {open && (
        <div ref={panelRef} className="flex max-h-[min(42rem,calc(100vh-8rem))] w-[min(100vw-2rem,23rem)] flex-col overflow-hidden rounded-[26px] border border-[color:var(--primary)]/20 bg-[color:var(--background-elevated)]/95 shadow-[0_24px_70px_rgba(107,38,217,0.14)] backdrop-blur-xl lg:max-h-[min(42rem,calc(100vh-7rem))]">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--primary)]/15 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--primary)]/15 text-[color:var(--primary)]">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[color:var(--text-strong)]">{greeting.title}</p>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">{greeting.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="hidden rounded-full border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10 px-3 py-2 text-xs font-bold text-[color:var(--primary)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/20 sm:inline-flex"
              >
                {humanLabel}
              </a>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="secondary"
                className="h-10 w-10 rounded-full p-0 text-[color:var(--text-strong)] shadow-none hover:text-[color:var(--primary)]"
                aria-label="Close chat"
              >
                <X size={17} />
              </Button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div ref={transcriptRef} className="chat-transcript min-h-[13rem] flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.author === "AI"
                      ? "chat-bubble chat-bubble--assistant"
                      : "ml-auto chat-bubble chat-bubble--user"
                  }
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>{message.author === "AI" ? "Assistant" : "You"}</span>
                    <span>{message.time}</span>
                  </div>
                  {message.author === "AI" ? (
                    <div className="mt-2 text-sm leading-6">
                      <MarkdownRenderer content={message.text} isUser={false} />
                    </div>
                  ) : (
                    <p className="mt-2 text-sm leading-6 wrap-break-word text-[color:var(--text-strong)]">
                      {message.text}
                    </p>
                  )}
                  {message.id === 1 && !hasConversationStarted ? (
                    <div className="mt-4 grid grid-cols-2 gap-1.5">
                      {quickReplies.map((reply) => (
                        <button
                          key={reply}
                          type="button"
                          onClick={() => handleSend(reply)}
                          className="rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-2.5 py-2 text-[10px] font-black leading-tight text-[color:var(--text-muted)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 hover:text-[color:var(--text-strong)]"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              {loading ? (
                <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                  <span className="flex items-center gap-2">
                    <span className="typing-dot" />
                    <span className="typing-dot" style={{ animationDelay: "120ms" }} />
                    <span className="typing-dot" style={{ animationDelay: "240ms" }} />
                  </span>
                  <span className="text-sm lowercase text-[color:var(--text-muted)]">typing</span>
                </div>
              ) : null}
            </div>

            <div className="rounded-b-[26px] border-t border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-4">
              <div>
                <div className="chat-composer-shell flex min-w-0 items-end gap-2 rounded-[18px] border border-transparent bg-[color:var(--surface-soft)] px-3 py-2 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[color:var(--primary)]/35 focus-within:shadow-[0_0_0_4px_rgba(107,38,217,0.10)]">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      adjustTextareaHeight(event.target);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend(draft);
                      }
                    }}
                    placeholder="Ask about scope, budget, or timeline"
                    rows={1}
                    className="chat-composer-textarea max-h-[10.5rem] min-h-[2.75rem] min-w-0 flex-1 resize-none overflow-y-auto whitespace-pre-wrap border-0 bg-transparent py-3 text-sm leading-6 text-[color:var(--text-strong)] shadow-none outline-none ring-0 focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:border-transparent focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent placeholder:text-[color:var(--text-faint)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  />
                  <Button type="button" onClick={() => handleSend(draft)} className="h-10 w-10 rounded-full p-0 text-sm" disabled={loading || !draft.trim()} aria-label="Send message">
                    <Send size={16} />
                  </Button>
                </div>
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[color:var(--primary)] sm:hidden">
                  Talk to {humanLabel} <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-[0_18px_40px_rgba(107,38,217,0.24)] transition duration-200 hover:scale-[1.02]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <MessageCircle size={24} />
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-white/20 bg-white text-[10px] font-bold text-[color:var(--primary)]">AI</span>
      </Button>
    </div>
  );
}
