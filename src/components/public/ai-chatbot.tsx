"use client";

import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const initialMessages = [
  {
    id: 1,
    author: "AI",
    text: "👋Hi, I can help you choose a service, shape a brief, or find the quickest way to reach Martin.",
    time: "Now"
  }
];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const messageIdRef = useRef(2);
  const hasConversationStarted = messages.length > 1;

  const quickReplies = useMemo(
    () => [
      "Choose a service",
      "Project timeline",
      "Budget guidance",
      "Talk to Martin"
    ],
    []
  );

  async function handleSend(content: string) {
    if (!content.trim()) return;

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

    window.setTimeout(() => {
      const aiMessageId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: aiMessageId,
          author: "AI",
          text: getAssistantReply(content),
          time: "Now"
        }
      ]);
      setLoading(false);
    }, 600);
  }

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
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3 sm:bottom-6">
      {open && (
        <div ref={panelRef} className="flex max-h-[min(42rem,calc(100vh-7rem))] w-[min(100vw-2rem,23rem)] flex-col overflow-hidden rounded-[26px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/96 shadow-[var(--shadow-sm)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[color:var(--text-strong)]">Project assistant</p>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">Fast guidance before handoff</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="mailto:info@martinmukoya.com"
                className="hidden rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-2 text-xs font-bold text-[color:var(--text-strong)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/10 sm:inline-flex"
              >
                Human
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
            <div ref={transcriptRef} className="min-h-[13rem] flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.author === "AI"
                      ? "max-w-[92%] rounded-[20px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] p-4"
                      : "ml-auto max-w-[88%] rounded-[20px] bg-[color:var(--primary)]/12 p-4 text-[color:var(--text-strong)]"
                  }
                >
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>{message.author === "AI" ? "Assistant" : "You"}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 break-words whitespace-pre-wrap text-[color:var(--text-muted)]">{message.text}</p>
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
                <div className="inline-flex max-w-[82%] items-center gap-2 rounded-[20px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-4 py-3 text-sm text-[color:var(--text-muted)]">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--primary)]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--primary)] [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--primary)] [animation-delay:240ms]" />
                  </span>
                  Thinking
                </div>
              ) : null}
            </div>

            <div className="rounded-b-[26px] border-t border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-4">
              <div>
                <div className="flex min-w-0 items-end gap-2 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface-soft)] px-3 py-2 transition focus-within:border-[color:var(--primary)]">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend(draft);
                      }
                    }}
                    placeholder="Ask about scope, budget, or timeline"
                    rows={1}
                    className="max-h-28 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto whitespace-pre-wrap bg-transparent py-3 text-sm leading-5 text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-faint)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  />
                  <Button type="button" onClick={() => handleSend(draft)} className="h-10 w-10 rounded-full p-0 text-sm" disabled={loading || !draft.trim()} aria-label="Send message">
                    <Send size={16} />
                  </Button>
                </div>
                <a href="mailto:info@martinmukoya.com" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[color:var(--primary)] sm:hidden">
                  Talk to Martin <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-[var(--shadow-sm)] transition hover:scale-[1.02]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <MessageCircle size={24} />
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-white/20 bg-white text-[10px] font-bold text-[color:var(--primary)]">AI</span>
      </Button>
    </div>
  );
}

function getAssistantReply(content: string) {
  const lower = content.toLowerCase();

  if (lower.includes("budget") || lower.includes("price")) {
    return "A useful budget range depends on scope, integrations, and launch urgency. For a first pass, share the business goal, must-have features, and what you already have in place.";
  }

  if (lower.includes("timeline") || lower.includes("asap")) {
    return "A focused site can move quickly, while booking systems, ecommerce, dashboards, and AI handovers need more planning and testing. The Start Project form captures enough context to estimate the next step.";
  }

  if (lower.includes("human") || lower.includes("martin") || lower.includes("whatsapp") || lower.includes("talk")) {
    return "Best next step: send a short note through the handoff link above, or use WhatsApp if timing is urgent.";
  }

  if (lower.includes("service") || lower.includes("choose")) {
    return "If the goal is more enquiries, start with a website or lead system. If the pain is scheduling, choose booking. If work is repetitive, AI automation may fit. Ecommerce is best when products and order flow are central.";
  }

  return "That sounds like something we can shape into a practical brief. Tell me the goal, the current friction, and what a good outcome would look like.";
}
