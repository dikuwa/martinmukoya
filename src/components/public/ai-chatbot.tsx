"use client";

import { Button } from "@/components/ui/button";
import { BudgetSelector, type BudgetOption } from "@/components/public/budget-selector";
import { ArrowUpRight, CheckCircle, Loader2, MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";
import { trackEvent } from "@/lib/analytics-client";

const whatsappHref = "https://wa.me/264818563005";
const emailHref = {
  "flextech-media": "mailto:info@flextech-media.com",
  "martin-mukoya": "mailto:info@martinmukoya.com"
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+264|0)\s*[1-9]\d{1,2}\s*\d{3,7}/;

type LeadCaptureFields = {
  name: string;
  email: string;
  phone: string;
  service: string;
  description: string;
  budget: string;
  budgetLabel: string;
  timeline: string;
  preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
  conversationSummary: string;
};

const initialLeadCapture: LeadCaptureFields = {
  name: "",
  email: "",
  phone: "",
  service: "",
  description: "",
  budget: "",
  budgetLabel: "",
  timeline: "",
  preferredContact: "EMAIL",
  conversationSummary: "",
};

/** Keywords in an AI response that hint at which field the AI is asking about. */
function detectAiTopic(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\byour name\b|\bwhat should i call you\b|\bmay i ask your name\b|\bfirst.*name\b/i.test(lower)) return "name";
  if (/\b(email|phone|contact|reach you|best way to)\b/.test(lower)) return "contact";
  if (/\b(service|building|looking for|type of project|what.*need|what.*want)\b/.test(lower)) return "service";
  if (/\b(describe|tell me about|briefly describe|explain.*project|what does.*project)\b/.test(lower)) return "description";
  if (/\b(budget|range|spending|afford|N\$|cost|price range|budget range)\b/.test(lower)) return "budget";
  if (/\b(timeline|deadline|how soon|timeframe|how quickly)\b/.test(lower)) return "timeline";
  return null;
}

/** Check if a user message shows buying/project intent. */
function hasBuyingIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /\b(website|app|build|create|develop|need.*help|service|quote|cost|price|budget|ecommerce|booking|dashboard|automation|ai|campaign|design|landing page|project|system|platform|store|shop|i want|i need|can you|how much|looking for)\b/.test(lower)
  );
}

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

  // ── Lead capture state ──
  const [leadCapture, setLeadCapture] = useState<LeadCaptureFields>(initialLeadCapture);
  const [leadCaptureActive, setLeadCaptureActive] = useState(false);
  const [lastAiTopic, setLastAiTopic] = useState<string | null>(null);
  const [showBudgetCards, setShowBudgetCards] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

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

  // ── Extract field from user message based on current AI topic ──
  function extractField(content: string): Partial<LeadCaptureFields> {
    const update: Partial<LeadCaptureFields> = {};

    // Always check for email and phone regardless of topic
    const emailMatch = content.match(EMAIL_RE);
    if (emailMatch) {
      update.email = emailMatch[0];
      update.preferredContact = "EMAIL";
    }

    const phoneMatch = content.match(PHONE_RE);
    if (phoneMatch) {
      update.phone = phoneMatch[0].trim();
      if (!update.preferredContact) update.preferredContact = "PHONE";
    }

    // If we have a detected topic, classify the main content
    if (lastAiTopic === "name" && !leadCapture.name) {
      // Take the first meaningful part of the message as the name
      const cleaned = content.replace(EMAIL_RE, "").replace(PHONE_RE, "").trim();
      const words = cleaned.split(/\s+/).filter(Boolean);
      if (words.length <= 4) {
        update.name = cleaned.slice(0, 60);
      }
    }

    if (lastAiTopic === "service" && !leadCapture.service) {
      update.service = content.replace(EMAIL_RE, "").replace(PHONE_RE, "").trim().slice(0, 100);
    }

    if (lastAiTopic === "description" && !leadCapture.description) {
      update.description = content.replace(EMAIL_RE, "").replace(PHONE_RE, "").trim().slice(0, 500);
    }

    if (lastAiTopic === "timeline" && !leadCapture.timeline) {
      update.timeline = content.replace(EMAIL_RE, "").replace(PHONE_RE, "").trim().slice(0, 100);
    }

    // Generic fallback: if no specific topic but we see buying intent
    if (!lastAiTopic || lastAiTopic === "contact") {
      const cleaned = content.replace(EMAIL_RE, "").replace(PHONE_RE, "").trim();
      if (!leadCapture.name && cleaned.length > 0 && cleaned.split(/\s+/).length <= 4) {
        update.name = cleaned.slice(0, 60);
      }
    }

    return update;
  }

  // ── Check if enough fields collected to submit ──
  const canSubmitLead = useMemo(() => {
    return (
      leadCaptureActive &&
      leadCapture.name.length > 0 &&
      (leadCapture.email.length > 0 || leadCapture.phone.length > 0) &&
      leadCapture.service.length > 0 &&
      leadCapture.description.length > 0 &&
      leadCapture.budget.length > 0
    );
  }, [leadCaptureActive, leadCapture.name, leadCapture.email, leadCapture.phone, leadCapture.service, leadCapture.description, leadCapture.budget]);

  // ── Submit lead to backend ──
  const submitLead = useCallback(async () => {
    if (leadSubmittingRef.current || leadSubmittedRef.current) return;
    setLeadSubmitting(true);

    try {
      // Build conversation summary from messages
      const conversationSummary = messages
        .slice(1) // Skip greeting
        .filter((m) => m.author === "You")
        .map((m) => m.text)
        .slice(-5)
        .join(" | ");

      const res = await fetch("/api/chatbot/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadCapture,
          siteSlug: siteSlugRef.current,
          conversationSummary: conversationSummary || leadCapture.description,
          sessionId,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save");
      }

      setLeadSubmitted(true);

      // Add confirmation message
      const confirmMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: confirmMsgId,
          author: "AI",
          text: `✅ Thanks, **${leadCapture.name}**! Your project request has been submitted successfully.\n\nHere's a summary of what you shared:\n- **Service:** ${leadCapture.service}\n- **Budget:** ${leadCapture.budgetLabel}\n- **Description:** ${leadCapture.description}\n\nThe team will review your request and get back to you soon. In the meantime, feel free to ask any other questions!`,
          time: "Now",
        },
      ]);

      trackEvent({
        eventType: "chatbot_lead_submitted",
        siteSlug: siteSlugRef.current,
        page: window.location.pathname,
        source: "chatbot",
      });
    } catch (err) {
      // Add error message
      const errorMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: errorMsgId,
          author: "AI",
          text: "I could not save your request right now. Please try again or contact us directly.",
          time: "Now",
        },
      ]);
    } finally {
      setLeadSubmitting(false);
    }
  }, [leadCapture, leadSubmitting, leadSubmitted, messages, sessionId]);

  // ── Refs to avoid stale closures ──
  const leadCaptureRef = useRef(leadCapture);
  const lastAiTopicRef = useRef<string | null>(null);
  const leadCaptureActiveRef = useRef(false);
  const leadSubmittedRef = useRef(false);
  const leadSubmittingRef = useRef(false);
  const loadingRef = useRef(false);

  // Keep refs in sync with state
  leadCaptureRef.current = leadCapture;
  lastAiTopicRef.current = lastAiTopic;
  leadCaptureActiveRef.current = leadCaptureActive;
  leadSubmittedRef.current = leadSubmitted;
  leadSubmittingRef.current = leadSubmitting;
  loadingRef.current = loading;

  // ── Send message to AI API (reusable by handleSend and budget select) ──
  const sendToApi = useCallback(
    async (content: string, aiMsgCallback?: () => void) => {
      // React calls the updater synchronously, so aiMessageId is set immediately
      let aiMessageId: number;
      setMessages((current) => {
        aiMessageId = messageIdRef.current++;
        return [
          ...current,
          { id: aiMessageId, author: "AI", text: "", time: "Now" },
        ];
      });

      try {
        const res = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            sessionId,
            siteSlug: siteSlugRef.current,
          }),
        });

        if (!res.body) throw new Error("No response body");
        const nextSessionId = res.headers.get("X-Chat-Session-Id");
        if (nextSessionId) {
          setSessionId(nextSessionId);
        }

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(
            payload?.error || "The AI assistant is temporarily unavailable."
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let fullAssistantText = "";

        while (!done) {
          const { value, done: d } = await reader.read();
          done = !!d;
          if (value) {
            const chunk = decoder.decode(value);
            fullAssistantText += chunk;
            const id = aiMessageId!;
            setMessages((current) =>
              current.map((m) =>
                m.id === id ? { ...m, text: m.text + chunk } : m
              )
            );
          }
        }

        // After AI response, detect topic for next user message
        if (leadCaptureActiveRef.current && !leadSubmittedRef.current) {
          const topic = detectAiTopic(fullAssistantText);
          setLastAiTopic(topic);

          // Show budget cards if budget topic detected and no budget yet
          if (
            topic === "budget" &&
            !leadCaptureRef.current.budget
          ) {
            setShowBudgetCards(true);
          }
        }

        aiMsgCallback?.();
      } catch (err) {
        const id = aiMessageId!;
        setMessages((current) =>
          current.map((m) =>
            m.id === id
              ? {
                  ...m,
                  text:
                    err instanceof Error
                      ? err.message
                      : "The AI assistant is temporarily unavailable.",
                }
              : m
          )
        );
      }
    },
    [sessionId]
  );

  // ── Handle budget selection ──
  const handleBudgetSelect = useCallback(
    (option: BudgetOption) => {
      // Update state and ref synchronously so sendToApi sees latest budget
      leadCaptureRef.current = {
        ...leadCaptureRef.current,
        budget: option.value,
        budgetLabel: option.label,
      };
      setLeadCapture((prev) => ({
        ...prev,
        budget: option.value,
        budgetLabel: option.label,
      }));
      setShowBudgetCards(false);

      const budgetMsg = `My budget range is ${option.label}`;

      // Add the budget message to the chat
      const budgetMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: budgetMsgId,
          author: "You",
          text: budgetMsg,
          time: "Now",
        },
      ]);

      // Set loading to prevent overlapping sends, then send to AI API
      setLoading(true);
      sendToApi(budgetMsg, () => {
        setLoading(false);
      });

      trackEvent({
        eventType: "chatbot_budget_selected",
        siteSlug: siteSlugRef.current,
        page: window.location.pathname,
        source: "chatbot",
        metadata: { budget: option.value },
      });
    },
    [sendToApi]
  );

  // ── Handle sending a message ──
  async function handleSend(content: string) {
    if (!content.trim() || loadingRef.current) return;

    trackEvent({
      eventType: "chatbot_message_sent",
      siteSlug: siteSlugRef.current,
      page: window.location.pathname,
      source: "chatbot"
    });

    // Detect buying intent to activate lead capture
    if (!leadCaptureActiveRef.current && !leadSubmittedRef.current && hasBuyingIntent(content)) {
      setLeadCaptureActive(true);
    }

    // Extract fields from user message if lead capture is active
    if (leadCaptureActiveRef.current && !leadSubmittedRef.current) {
      const extracted = extractField(content);
      if (Object.keys(extracted).length > 0) {
        setLeadCapture((prev) => ({ ...prev, ...extracted }));
      }
    }

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

    await sendToApi(content, () => {
      setLoading(false);
    });
  }

  // ── Resubmit lead if user clicks retry on error ──
  const handleRetrySubmit = useCallback(() => {
    // Update refs synchronously so submitLead's guard check passes
    leadSubmittedRef.current = false;
    leadSubmittingRef.current = false;
    setLeadSubmitted(false);
    setLeadSubmitting(false);
    submitLead();
  }, [submitLead]);

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
                href={emailHref[siteSlug as keyof typeof emailHref] ?? emailHref["martin-mukoya"]}
                className="hidden rounded-full border border-[color:var(--primary)]/20 bg-[color:var(--primary)]/10 px-3 py-2 text-xs font-bold text-[color:var(--primary)] transition hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]/20 sm:inline-flex"
                onClick={() => trackEvent({ eventType: "email_click", siteSlug, page: window.location.pathname, source: "chatbot_header" })}
              >
                Email
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
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

              {/* ── Budget selector cards ── */}
              {showBudgetCards && !leadSubmitted && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>Budget</span>
                  </div>
                  <div className="mt-2">
                    <p className="mb-3 text-sm font-semibold text-[color:var(--text-strong)]">
                      Select your budget range:
                    </p>
                    <BudgetSelector
                      selected={leadCapture.budget}
                      onSelect={handleBudgetSelect}
                      disabled={leadSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* ── Submit button ── */}
              {canSubmitLead && !leadSubmitted && !leadSubmitting && !showBudgetCards && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={submitLead}
                    className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[color:var(--primary)]/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[color:var(--primary)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40"
                  >
                    <CheckCircle size={18} />
                    Submit my project request
                  </button>
                </div>
              )}

              {/* ── Submitting loader ── */}
              {leadSubmitting && (
                <div className="flex justify-center pt-1">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--primary)]/80 px-5 py-3 text-sm font-bold text-white">
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </div>
                </div>
              )}

              {/* ── Retry on error ── */}
              {leadSubmitted && messages[messages.length - 1]?.text.includes("could not save") && (
                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleRetrySubmit}
                    className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--destructive)] px-5 py-3 text-sm font-bold text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/10"
                  >
                    Try again
                  </button>
                </div>
              )}

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
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[color:var(--primary)] sm:hidden">
                  Talk to {humanLabel} <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((current) => {
          const next = !current;
          if (next) {
            trackEvent({
              eventType: "chatbot_opened",
              siteSlug,
              page: window.location.pathname,
              source: "chatbot_launcher"
            });
          }
          return next;
        })}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-[0_18px_40px_rgba(107,38,217,0.24)] transition duration-200 hover:scale-[1.02]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <MessageCircle size={24} />
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-white/20 bg-white text-[10px] font-bold text-[color:var(--primary)]">AI</span>
      </Button>
    </div>
  );
}
