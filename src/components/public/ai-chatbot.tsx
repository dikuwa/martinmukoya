"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const initialMessages = [
  {
    id: 1,
    author: "AI",
    text: "Hi there! I can help you shape your project brief, pick the right services, and estimate timelines. Ask me anything about your website, booking system, ecommerce or automation needs.",
    time: "Now"
  }
];

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const quickReplies = useMemo(
    () => [
      "Help me choose services",
      "Suggest a timeline",
      "I want an ecommerce site",
      "How can AI improve leads?"
    ],
    []
  );

  async function handleSend(content: string) {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now(),
      author: "You",
      text: content,
      time: "Now"
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          author: "AI",
          text: "Thanks for sharing. I can help you package this into a clear brief and recommend the next project step.",
          time: "Now"
        }
      ]);
      setLoading(false);
    }, 600);
  }

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
        <div ref={panelRef} className="w-[min(100vw-2rem,22rem)] rounded-[28px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]/95 shadow-[0_32px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--border-subtle)] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                <MessageCircle size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--text-faint)]">AI assistant</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--text-strong)]">Project chatbot</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 w-11 rounded-full border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-0 text-[color:var(--text-strong)] hover:bg-[color:var(--surface)]"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="max-h-[36rem] flex flex-col min-h-0">
            <div className="space-y-3 px-4 py-4 overflow-y-auto flex-1 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.author === "AI"
                      ? "rounded-[22px] border border-[color:var(--border-subtle)] bg-white/[0.04] p-4"
                      : "ml-auto rounded-[22px] bg-[color:var(--accent)]/10 p-4 text-[color:var(--text-strong)]"
                  }
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-faint)]">
                    <span>{message.author}</span>
                    <span>{message.time}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 break-words whitespace-pre-wrap text-[color:var(--text-muted)]">{message.text}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-[color:var(--border-subtle)] bg-[color:var(--background)]/90 px-4 py-4">
              <div className="grid gap-2">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    type="button"
                    onClick={() => handleSend(reply)}
                    className="rounded-full border border-[color:var(--border-subtle)] bg-white/[0.04] px-4 py-2 text-sm text-[color:var(--text-strong)] transition hover:border-[color:var(--accent)] hover:bg-[color:var(--accent)]/10"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-[color:var(--border-subtle)] bg-white/[0.04] px-3 py-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend(draft);
                    }
                  }}
                  placeholder="Ask the assistant"
                  className="h-11 w-full bg-transparent text-sm text-[color:var(--text-strong)] outline-none placeholder:text-[color:var(--text-faint)]"
                />
                <Button type="button" onClick={() => handleSend(draft)} className="h-11 rounded-[16px] px-4 text-sm" disabled={loading || !draft.trim()}>
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-[0_18px_50px_rgba(246,149,59,0.35)] transition hover:scale-[1.02]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <MessageCircle size={24} />
      </Button>
    </div>
  );
}
