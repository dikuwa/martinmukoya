"use client";

import { BudgetSelector, type BudgetOption } from "@/components/public/budget-selector";
import { ServiceSelector } from "@/components/public/service-selector";
import { TimelineSelector, type TimelineOption } from "@/components/public/timeline-selector";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CheckCircle,
  Mail,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownRenderer } from "./markdown-renderer";
import { BuyerIntentCard } from "./buyer-intent-card";
import { detectBuyerIntent, TRIGGER_THRESHOLD } from "@/lib/buyer-intent";
import { trackEvent } from "@/lib/analytics-client";

const whatsappHref = "https://wa.me/264818563005";
const emailHref = "mailto:hello@martinmukoya.com";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE_RE = /(?:\+264|0)\s*[1-9]\d{1,2}\s*\d{3,7}/;

type BookingStep = "NONE" | "SERVICES" | "BUDGET" | "TIMELINE" | "CONTACT" | "REVIEW" | "SUBMITTED";

type BookingData = {
  services: string[];
  customServiceDetails: string;
  budget: string;
  budgetLabel: string;
  timeline: string;
  timelineLabel: string;
  timelineFlexible: boolean;
  name: string;
  email: string;
  phone: string;
  preferredContact: "EMAIL" | "PHONE" | "WHATSAPP";
  company: string;
  description: string;
  conversationSummary: string;
};

const initialBookingData: BookingData = {
  services: [],
  customServiceDetails: "",
  budget: "",
  budgetLabel: "",
  timeline: "",
  timelineLabel: "",
  timelineFlexible: false,
  name: "",
  email: "",
  phone: "",
  preferredContact: "EMAIL",
  company: "",
  description: "",
  conversationSummary: "",
};

const serviceLabels: Record<string, string> = {
  "web-applications": "Web Applications",
  "booking-systems": "Booking Systems",
  ecommerce: "E-commerce",
  "ai-automations": "AI Automations",
  other: "Other",
};

function siteAwareGreeting(slug: string) {
  if (slug === "flextech-media") {
    return {
      title: "Project Assistant",
      initial:
        "👋 Hi! I'm your FlexTech assistant. I can help you explore our services, shape a project brief, or connect you with the right team quickly.",
      humanLabel: "Team",
    };
  }
  return {
    title: "Project Assistant",
    initial:
      "👋 Hi! I'm your Martin assistant. I can help you choose the right solution, shape your project brief, or contact Martin quickly.",
    humanLabel: "Human",
  };
}

const servicesValueLabel: Record<string, string> = {
  "web-applications": "Web Applications",
  "booking-systems": "Booking Systems",
  ecommerce: "E-commerce",
  "ai-automations": "AI Automations",
  other: "Other",
};

export function AIChatbot({ siteSlug = "martin-mukoya" }: { siteSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ id: number; author: string; text: string; time: string; cardType?: "buyer-intent" }>
  >(() => [
    {
      id: 1,
      author: "AI",
      text: siteAwareGreeting(siteSlug).initial,
      time: "Now",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // ── Booking state ──
  const [bookingStep, setBookingStep] = useState<BookingStep>("NONE");
  const [bookingData, setBookingData] = useState<BookingData>(initialBookingData);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadError, setLeadError] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [intentCardShown, setIntentCardShown] = useState(false);

  const siteSlugRef = useRef(siteSlug);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIdRef = useRef(2);
  const bookingStepRef = useRef(bookingStep);
  const leadSubmittingRef = useRef(false);
  const loadingRef = useRef(false);

  bookingStepRef.current = bookingStep;
  leadSubmittingRef.current = leadSubmitting;
  loadingRef.current = loading;

  const humanLabel = useMemo(
    () => siteAwareGreeting(siteSlug).humanLabel,
    [siteSlug]
  );

  // ── Service name helper ──
  const selectedServiceNames = useMemo(() => {
    return bookingData.services
      .map((s) => servicesValueLabel[s] ?? s)
      .join(", ");
  }, [bookingData.services]);

  // ── Copy greeting for the start page ──
  const greeting = useMemo(() => siteAwareGreeting(siteSlug), [siteSlug]);

  // ── Start booking flow from action card ──
  const startBooking = useCallback(() => {
    // If already in booking, reset cleanly first
    if (bookingStep !== "NONE" && bookingStep !== "SUBMITTED") {
      setBookingData(initialBookingData);
    }

    // Add user message
    const userMsgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: userMsgId,
        author: "You",
        text: "Choose a service",
        time: "Now",
      },
    ]);

    // Add AI message with service selector
    const aiMsgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: aiMsgId,
        author: "AI",
        text:
          "Great choice! Let's start with what you need built.\n\n**What service are you looking for?** You can pick more than one.",
        time: "Now",
      },
    ]);

    setBookingStep("SERVICES");
  }, [bookingStep]);

  // ── Handle service selection ──
  const handleServicesDone = useCallback(() => {
    // Check if "Other" is selected but no custom details
    if (
      bookingData.services.includes("other") &&
      bookingData.customServiceDetails.trim().length === 0
    ) {
      return; // Require custom details for "Other"
    }

    if (bookingData.services.length === 0) return; // At least one required

    const userMsgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: userMsgId,
        author: "You",
        text: `I need help with: ${selectedServiceNames}`,
        time: "Now",
      },
    ]);

    const aiMsgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: aiMsgId,
        author: "AI",
        text:
          `**${selectedServiceNames}** — great choices! Those are right up our alley.\n\nNow, **what budget range are you considering?** This helps us tailor the solution to your needs.`,
        time: "Now",
      },
    ]);

    setBookingStep("BUDGET");
  }, [bookingData.services, bookingData.customServiceDetails, selectedServiceNames]);

  // ── Handle budget selection ──
  const handleBudgetSelect = useCallback(
    (option: BudgetOption) => {
      setBookingData((prev) => ({
        ...prev,
        budget: option.value,
        budgetLabel: option.label,
      }));

      const msgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: msgId,
          author: "You",
          text: `My budget is ${option.label}`,
          time: "Now",
        },
      ]);

      const aiMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: aiMsgId,
          author: "AI",
          text: `${option.label} — noted! That gives us a good sense of scope.\n\nNow, **when are you looking to get started?**`,
          time: "Now",
        },
      ]);

      setBookingStep("TIMELINE");
    },
    []
  );

  // ── Handle timeline selection ──
  const handleTimelineSelect = useCallback((option: TimelineOption) => {
    setBookingData((prev) => ({
      ...prev,
      timeline: option.value,
      timelineLabel: option.label,
      timelineFlexible: option.value === "flexible",
    }));

    const msgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: msgId,
        author: "You",
        text: `Timeline: ${option.label}`,
        time: "Now",
      },
    ]);

    const aiMsgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: aiMsgId,
        author: "AI",
        text:
          `**${option.label}** — perfect, we'll keep that in mind.\n\nAlmost done! Just need a few contact details so we can follow up with you.`,
        time: "Now",
      },
    ]);

    setBookingStep("CONTACT");
  }, []);

  // ── Handle contact form submission ──
  const handleContactDone = useCallback(() => {
    const { name, email, phone, description } = bookingData;
    if (!name.trim()) return;
    if (!email.trim() && !phone.trim()) return;
    if (!description.trim()) return;

    const msgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: msgId,
        author: "You",
        text: `Name: ${name}\nEmail: ${email || "—"}\nPhone: ${phone || "—"}\nCompany: ${bookingData.company || "—"}\nProject: ${description.slice(0, 100)}${description.length > 100 ? "..." : ""}`,
        time: "Now",
      },
    ]);

    setBookingStep("REVIEW");
  }, [bookingData]);

  // ── Submit lead ──
  const submitBooking = useCallback(async () => {
    if (leadSubmittingRef.current) return;
    leadSubmittingRef.current = true;
    setLeadSubmitting(true);

    const conversationSummary = messages
      .filter((m) => m.author === "You")
      .map((m) => m.text)
      .slice(-8)
      .join(" | ");

    try {
      const res = await fetch("/api/chatbot/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
          service: selectedServiceNames,
          description: bookingData.description,
          budget: bookingData.budget,
          budgetLabel: bookingData.budgetLabel,
          timeline: bookingData.timelineLabel,
          preferredContact: bookingData.preferredContact,
          businessName: bookingData.company || undefined,
          conversationSummary,
          sessionId,
          siteSlug: siteSlugRef.current,
          services: bookingData.services,
          customServiceDetails: bookingData.customServiceDetails || undefined,
          timelineFlexible: bookingData.timelineFlexible,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save");
      }

      setLeadSubmitted(true);
      setBookingStep("SUBMITTED");
      setLeadError(false);

      const confirmMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: confirmMsgId,
          author: "AI",
          text: `✅ Thanks, **${bookingData.name}**! Your project request has been submitted successfully.\n\nHere's a quick recap:\n- **Services:** ${selectedServiceNames}\n- **Budget:** ${bookingData.budgetLabel}\n- **Timeline:** ${bookingData.timelineLabel}\n- **Contact:** ${bookingData.email || bookingData.phone}\n\nOur team will review your request and get back to you soon. In the meantime, feel free to ask any other questions!`,
          time: "Now",
        },
      ]);

      trackEvent({
        eventType: "chatbot_lead_submitted",
        siteSlug: siteSlugRef.current,
        page: window.location.pathname,
        source: "chatbot",
      });
    } catch {
      setLeadError(true);
      setLeadSubmitting(false);
      leadSubmittingRef.current = false;

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
      // Always reset submitting state — the catch block already handles error-specific UI
      setLeadSubmitting(false);
      leadSubmittingRef.current = false;
    }
  }, [bookingData, selectedServiceNames, messages, sessionId, leadError]);

  // ── Back button handler ──
  const goBack = useCallback(() => {
    switch (bookingStep) {
      case "BUDGET":
        setBookingStep("SERVICES");
        break;
      case "TIMELINE":
        setBookingStep("BUDGET");
        break;
      case "CONTACT":
        setBookingStep("TIMELINE");
        break;
      case "REVIEW":
        setBookingStep("CONTACT");
        break;
      default:
        setBookingStep("NONE");
    }
  }, [bookingStep]);

  // ── Cancel booking ──
  const cancelBooking = useCallback(() => {
    setBookingStep("NONE");
    setBookingData(initialBookingData);
    setLeadSubmitted(false);
    setLeadError(false);
    setLeadSubmitting(false);

    const aiMsgId = messageIdRef.current++;
    setMessages((current) => [
      ...current,
      {
        id: aiMsgId,
        author: "AI",
        text: "No problem! Feel free to ask me anything about our services, or come back to start a project whenever you're ready.",
        time: "Now",
      },
    ]);
  }, []);

  // ── Handle service selection from buyer-intent card ──
  const handleIntentServiceSelect = useCallback(
    (
      _serviceId: string,
      label: string,
      serviceValue: string,
      customDetails?: string,
    ) => {
      // ── Handle "Something else" → ask for description ──
      if (_serviceId === "other-project") {
        const userMsgId = messageIdRef.current++;
        setMessages((current) => [
          ...current,
          {
            id: userMsgId,
            author: "You",
            text: "Something else — describe my project",
            time: "Now",
          },
        ]);

        const aiMsgId = messageIdRef.current++;
        setMessages((current) => [
          ...current,
          {
            id: aiMsgId,
            author: "AI",
            text: "Sure — briefly describe what you need, and I'll guide you from there.",
            time: "Now",
          },
        ]);

        return;
      }

      // Add user message showing their choice
      const userMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: userMsgId,
          author: "You",
          text: `I need help with ${label}`,
          time: "Now",
        },
      ]);

      // Pre-select the service in booking data
      setBookingData((prev) => ({
        ...prev,
        services: [serviceValue],
        ...(customDetails ? { customServiceDetails: customDetails } : {}),
      }));

      // Context-aware AI response based on selected service
      const responses: Record<string, string> = {
        "web-apps":
          "Web applications & dashboards — excellent choice! Let's talk about your budget so I can recommend the right approach.",
        booking:
          "A booking system will save you and your customers time. Let's look at the budget that works for you.",
        ecommerce:
          "An online store — great choice! Let's talk about your budget to determine the best platform and features.",
        "ai-auto":
          "AI automation is a game-changer! Let's look at the budget that fits your automation needs.",
      };

      const aiMsgId = messageIdRef.current++;
      setMessages((current) => [
        ...current,
        {
          id: aiMsgId,
          author: "AI",
          text:
            responses[_serviceId] ||
            `**${label}** — great pick! What budget are you working with? This helps me tailor the solution.`,
          time: "Now",
        },
      ]);

      // Skip to budget step
      setBookingStep("BUDGET");

      trackEvent({
        eventType: "chatbot_action_click",
        siteSlug,
        page: window.location.pathname,
        source: "chatbot_intent_card",
        metadata: { action: "select_service", service: _serviceId },
      });
    },
    [siteSlug, humanLabel],
  );

  // ── Handle sending a normal chat message ──
  async function handleSend(content: string) {
    if (!content.trim() || loadingRef.current) return;

    trackEvent({
      eventType: "chatbot_message_sent",
      siteSlug: siteSlugRef.current,
      page: window.location.pathname,
      source: "chatbot",
    });

    const userMessageId = messageIdRef.current++;
    const userMessage = {
      id: userMessageId,
      author: "You",
      text: content,
      time: "Now",
    };
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    // ── Handle quick reply shortcuts ──
    const lower = content.toLowerCase();

    if (lower === "choose a service") {
      setDraft("");
      startBooking();
      setLoading(false);
      return;
    }

    if (lower === "budget guidance") {
      setDraft("");
      // Send to AI for normal chat response about budgets
      await sendToApi(
        content,
        "Tell me about your budget ranges and pricing options for your services.",
        () => setLoading(false)
      );
      return;
    }

    if (lower.startsWith("talk to")) {
      setDraft("");
      // Start a light booking flow for handover
      startBooking();
      setLoading(false);
      return;
    }

    // Normal chat: send to AI API
    const intentResult = detectBuyerIntent(content);
    const shouldShowCard = !intentCardShown && intentResult.triggered;

    // Track buyer intent detection
    if (intentResult.triggered) {
      trackEvent({
        eventType: "chatbot_buyer_intent",
        siteSlug: siteSlugRef.current,
        page: window.location.pathname,
        source: "chatbot",
        metadata: {
          intent_score: intentResult.score,
          matched_phrases: intentResult.matchedPhrases.slice(0, 5),
        },
      });
    }

    await sendToApi(content, content, () => {
      // Show buyer intent action card after AI finishes responding
      if (shouldShowCard) {
        const cardMsgId = messageIdRef.current++;
        setMessages((current) => [
          ...current,
          {
            id: cardMsgId,
            author: "AI",
            text: "",
            time: "Now",
            cardType: "buyer-intent",
          },
        ]);
        setIntentCardShown(true);

        // Track when card is shown
        trackEvent({
          eventType: "chatbot_intent_card_shown",
          siteSlug: siteSlugRef.current,
          page: window.location.pathname,
          source: "chatbot",
          metadata: {
            intent_score: intentResult.score,
            matched_phrases: intentResult.matchedPhrases.slice(0, 5),
          },
        });
      }
      setLoading(false);
    });
  }

  // ── Send to AI API ──
  const sendToApi = useCallback(
    async (
      displayContent: string,
      apiContent: string,
      cb?: () => void
    ) => {
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
            content: apiContent,
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
        let fullText = "";

        while (!done) {
          const { value, done: d } = await reader.read();
          done = !!d;
          if (value) {
            const chunk = decoder.decode(value);
            fullText += chunk;
            const id = aiMessageId!;
            setMessages((current) =>
              current.map((m) =>
                m.id === id ? { ...m, text: m.text + chunk } : m
              )
            );
          }
        }
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
      } finally {
        cb?.();
      }
    },
    [sessionId]
  );

  // ── Retry submit ──
  const handleRetry = useCallback(() => {
    setLeadError(false);
    setLeadSubmitting(false);
    submitBooking();
  }, [submitBooking]);

  // ── Effects ──
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 168)}px`;
    }
  }, [draft, open]);

  useEffect(() => {
    if (!open) return;
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open, bookingStep]);

  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // ── Online/offline detection ──
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const actionPillClass =
    "inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 py-2 text-[14px] font-bold leading-[14px] tracking-[-0.01em] not-italic text-[color:var(--text-strong)] transition-all duration-200 hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--primary)]/8 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/40";

  const isInBooking = bookingStep !== "NONE" && bookingStep !== "SUBMITTED";

  return (
    <div className="fixed bottom-24 right-6 z-[60] flex flex-col items-end gap-3 lg:bottom-6">
      {open && (
        <div
          ref={panelRef}
          className="flex max-h-[min(42rem,calc(100vh-8rem))] w-[min(100vw-2rem,23rem)] flex-col overflow-hidden rounded-[26px] border border-[color:var(--primary)]/20 bg-[color:var(--background-elevated)]/95 shadow-[0_24px_70px_rgba(107,38,217,0.14)] backdrop-blur-xl lg:max-h-[min(42rem,calc(100vh-7rem))]"
        >
          {/* ── Header ── */}
          <div className="border-b border-[color:var(--primary)]/15">
            {/* Top row: Logo + Title + Online dot | Close */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {isInBooking && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]"
                    aria-label="Go back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--primary)]/15 text-[color:var(--primary)]">
                  <MessageCircle size={16} />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[color:var(--text-strong)]">
                    {greeting.title}
                  </p>
                  <span
                    className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500 online-dot-pulse" : "bg-gray-400"}`}
                    title={isOnline ? "Online" : "Offline"}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--surface)] text-[color:var(--text-muted)] transition-all duration-200 hover:border-[color:var(--primary)]/30 hover:bg-[color:var(--primary)]/8 hover:text-[color:var(--primary)]"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>

            {/* Bottom row: Service, WhatsApp, Call — always visible */}
            <div className="border-t border-[color:var(--border-subtle)] px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {/* Choose a Service */}
                  <button
                    type="button"
                    onClick={() => {
                      trackEvent({
                        eventType: "chatbot_action_click",
                        siteSlug,
                        page: window.location.pathname,
                        source: "chatbot_action_card",
                        metadata: { action: "choose_service" },
                      });
                      startBooking();
                    }}
                    className={actionPillClass}
                    aria-label="Choose a service to start a project"
                  >
                    <Briefcase size={14} />
                    Services
                  </button>

                  {/* WhatsApp */}
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionPillClass}
                    aria-label={`Chat with ${humanLabel} on WhatsApp`}
                    onClick={() =>
                      trackEvent({
                        eventType: "whatsapp_click",
                        siteSlug,
                        page: window.location.pathname,
                        source: "chatbot_action_card",
                      })
                    }
                  >
                    <MessageCircle size={14} />
                    WhatsApp
                  </a>

                  {/* Email */}
                  <a
                    href={emailHref}
                    className={actionPillClass}
                    aria-label="Email us"
                    onClick={() =>
                      trackEvent({
                        eventType: "email_click",
                        siteSlug,
                        page: window.location.pathname,
                        source: "chatbot_action_card",
                      })
                    }
                  >
                    <Mail size={14} />
                    Email
                  </a>

                  {/* Call */}
                  <a
                    href={"tel:+264818563005"}
                    className={actionPillClass}
                    aria-label="Call us"
                    onClick={() =>
                      trackEvent({
                        eventType: "call_click",
                        siteSlug,
                        page: window.location.pathname,
                        source: "chatbot_action_card",
                      })
                    }
                  >
                    <Phone size={14} />
                    Call
                  </a>
                </div>
              </div>
          </div>

          {/* ── Chat Transcript ── */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              ref={transcriptRef}
              className="chat-transcript min-h-[13rem] flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((message) => {
                // Render buyer-intent card as a standalone element
                if (message.cardType === "buyer-intent") {
                  return (
                    <div key={message.id} className="chat-bubble chat-bubble--assistant">
                      <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                        <span>Assistant</span>
                        <span>{message.time}</span>
                      </div>
                      <div className="mt-2">
                        <BuyerIntentCard
                          onSelectService={handleIntentServiceSelect}
                          onWhatsApp={() =>
                            trackEvent({
                              eventType: "whatsapp_click",
                              siteSlug,
                              page: window.location.pathname,
                              source: "chatbot_intent_card",
                            })
                          }
                          onCall={() =>
                            trackEvent({
                              eventType: "call_click",
                              siteSlug,
                              page: window.location.pathname,
                              source: "chatbot_intent_card",
                            })
                          }
                          whatsappHref={whatsappHref}
                          humanLabel={humanLabel}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={
                      message.author === "AI"
                        ? "chat-bubble chat-bubble--assistant"
                        : "ml-auto chat-bubble chat-bubble--user"
                    }
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                      <span>
                        {message.author === "AI" ? "Assistant" : "You"}
                      </span>
                      <span>{message.time}</span>
                    </div>
                    {message.author === "AI" ? (
                      <div className="mt-2 text-sm leading-6">
                        <MarkdownRenderer
                          content={message.text}
                          isUser={false}
                        />
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 break-words text-[color:var(--text-strong)]">
                        {message.text}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* ═══ Step 1: Service Selector ═══ */}
              {bookingStep === "SERVICES" && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>Choose your services</span>
                  </div>
                  <div className="mt-2">
                    <ServiceSelector
                      selected={bookingData.services}
                      onSelect={(values) =>
                        setBookingData((prev) => ({
                          ...prev,
                          services: values,
                        }))
                      }
                      onCustomDetails={(details) =>
                        setBookingData((prev) => ({
                          ...prev,
                          customServiceDetails: details,
                        }))
                      }
                      customDetails={bookingData.customServiceDetails}
                      disabled={leadSubmitting}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={cancelBooking}
                        className="text-xs font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text-muted)]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleServicesDone}
                        disabled={
                          bookingData.services.length === 0 ||
                          (bookingData.services.includes("other") &&
                            bookingData.customServiceDetails.trim().length ===
                              0)
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[color:var(--primary)]/15 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[color:var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 2: Budget Selector ═══ */}
              {bookingStep === "BUDGET" && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>Budget</span>
                    <span className="text-[color:var(--text-faint)]">
                      Optional
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="mb-3 text-sm font-semibold text-[color:var(--text-strong)]">
                      What budget range are you considering?
                    </p>
                    <BudgetSelector
                      selected={bookingData.budget}
                      onSelect={handleBudgetSelect}
                      disabled={leadSubmitting}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setBookingStep("SERVICES")}
                        className="text-xs font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text-muted)]"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleBudgetSelect({
                            value: "not-specified",
                            label: "Not specified",
                            description: "Skip budget for now",
                          })
                        }
                        className="text-xs font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text-muted)]"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 3: Timeline Selector ═══ */}
              {bookingStep === "TIMELINE" && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>Timeline</span>
                  </div>
                  <div className="mt-2">
                    <p className="mb-3 text-sm font-semibold text-[color:var(--text-strong)]">
                      When would you like to get started?
                    </p>
                    <TimelineSelector
                      selected={bookingData.timeline}
                      onSelect={handleTimelineSelect}
                      disabled={leadSubmitting}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setBookingStep("BUDGET")}
                        className="text-xs font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text-muted)]"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 4: Contact Form ═══ */}
              {bookingStep === "CONTACT" && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>Your details</span>
                  </div>
                  <div className="mt-2 space-y-3">
                    {/* Name */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[color:var(--text-muted)]">
                        Name <span className="text-[color:var(--primary)]">*</span>
                      </label>
                      <input
                        type="text"
                        value={bookingData.name}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Your name"
                        className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--text-strong)] transition focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none placeholder:text-[color:var(--text-faint)]"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[color:var(--text-muted)]">
                        Email{" "}
                        <span className="text-[color:var(--text-faint)]">
                          (or phone/WhatsApp)
                        </span>
                      </label>
                      <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--text-strong)] transition focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none placeholder:text-[color:var(--text-faint)]"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[color:var(--text-muted)]">
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                        placeholder="+264 81 234 5678"
                        className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--text-strong)] transition focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none placeholder:text-[color:var(--text-faint)]"
                      />
                    </div>

                    {/* Preferred contact */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-[color:var(--text-muted)]">
                        Preferred contact method
                      </label>
                      <div className="flex gap-2">
                        {(["EMAIL", "PHONE", "WHATSAPP"] as const).map(
                          (method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() =>
                                setBookingData((prev) => ({
                                  ...prev,
                                  preferredContact: method,
                                }))
                              }
                              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${
                                bookingData.preferredContact === method
                                  ? "border-[color:var(--primary)] bg-[color:var(--primary)]/10 text-[color:var(--primary)]"
                                  : "border-[color:var(--border-subtle)] text-[color:var(--text-muted)] hover:border-[color:var(--primary)]/30"
                              }`}
                            >
                              {method === "EMAIL"
                                ? "Email"
                                : method === "PHONE"
                                  ? "Phone"
                                  : "WhatsApp"}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[color:var(--text-muted)]">
                        Company / Organisation{" "}
                        <span className="text-[color:var(--text-faint)]">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        value={bookingData.company}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        placeholder="Your company"
                        className="w-full rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--text-strong)] transition focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none placeholder:text-[color:var(--text-faint)]"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-1 block text-xs font-bold text-[color:var(--text-muted)]">
                        Project description{" "}
                        <span className="text-[color:var(--primary)]">*</span>
                      </label>
                      <textarea
                        value={bookingData.description}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Briefly describe what you want to build..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3.5 py-2.5 text-sm text-[color:var(--text-strong)] transition focus:border-[color:var(--primary)]/50 focus:shadow-[0_0_0_4px_rgba(107,38,217,0.10)] focus:outline-none placeholder:text-[color:var(--text-faint)]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setBookingStep("TIMELINE")}
                        className="text-xs font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text-muted)]"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleContactDone}
                        disabled={
                          !bookingData.name.trim() ||
                          (!bookingData.email.trim() &&
                            !bookingData.phone.trim()) ||
                          !bookingData.description.trim()
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[color:var(--primary)] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[color:var(--primary)]/15 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[color:var(--primary)]/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Review
                        <ArrowUpRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══ Step 5: Review & Submit ═══ */}
              {bookingStep === "REVIEW" && (
                <div className="chat-bubble chat-bubble--assistant">
                  <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-faint)]">
                    <span>Review your request</span>
                  </div>
                  <div className="mt-2 space-y-2 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[color:var(--text-faint)]">
                        Services
                      </span>
                      <span className="font-bold text-right text-[color:var(--text-strong)]">
                        {selectedServiceNames}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--text-faint)]">
                        Budget
                      </span>
                      <span className="font-bold text-right text-[color:var(--text-strong)]">
                        {bookingData.budgetLabel || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[color:var(--text-faint)]">
                        Timeline
                      </span>
                      <span className="font-bold text-right text-[color:var(--text-strong)]">
                        {bookingData.timelineLabel}
                      </span>
                    </div>
                    <div className="border-t border-[color:var(--border-subtle)] pt-2">
                      <span className="text-[color:var(--text-faint)]">
                        Name
                      </span>
                      <span className="ml-2 font-bold text-[color:var(--text-strong)]">
                        {bookingData.name}
                      </span>
                    </div>
                    {(bookingData.email || bookingData.phone) && (
                      <div>
                        <span className="text-[color:var(--text-faint)]">
                          Contact
                        </span>
                        <span className="ml-2 text-[color:var(--text-strong)]">
                          {bookingData.email || bookingData.phone}
                          {bookingData.preferredContact && (
                            <span className="ml-1 text-[10px] text-[color:var(--text-faint)]">
                              via {bookingData.preferredContact.toLowerCase()}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {bookingData.company && (
                      <div>
                        <span className="text-[color:var(--text-faint)]">
                          Company
                        </span>
                        <span className="ml-2 text-[color:var(--text-strong)]">
                          {bookingData.company}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-[color:var(--border-subtle)] pt-2">
                      <span className="text-[color:var(--text-faint)]">
                        Project
                      </span>
                      <p className="mt-0.5 text-xs leading-5 text-[color:var(--text-strong)]">
                        {bookingData.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setBookingStep("CONTACT")}
                      className="text-xs font-medium text-[color:var(--text-faint)] transition hover:text-[color:var(--text-muted)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={submitBooking}
                      disabled={leadSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[color:var(--primary)]/20 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-[color:var(--primary)]/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {leadSubmitting ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Submit my project request
                        </>
                      )}
                    </button>
                  </div>

                  {/* Retry on error */}
                  {leadError && (
                    <div className="mt-2 flex justify-center">
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--destructive)] px-5 py-3 text-sm font-bold text-[color:var(--destructive)] transition hover:bg-[color:var(--destructive)]/10"
                      >
                        Try again
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Typing indicator ── */}
              {loading && (
                <div className="chat-bubble chat-bubble--assistant chat-bubble--typing">
                  <span className="flex items-center gap-2">
                    <span className="typing-dot" />
                    <span
                      className="typing-dot"
                      style={{ animationDelay: "120ms" }}
                    />
                    <span
                      className="typing-dot"
                      style={{ animationDelay: "240ms" }}
                    />
                  </span>
                  <span className="ml-1 text-sm lowercase text-[color:var(--text-muted)]">
                    typing
                  </span>
                </div>
              )}
            </div>

            {/* ── Input area ── */}
            <div className="rounded-b-[26px] border-t border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 py-4">
              <div>
                <div className="chat-composer-shell flex min-w-0 items-end gap-2 rounded-[18px] border border-transparent bg-[color:var(--surface-soft)] px-3 py-2 transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-[color:var(--primary)]/35 focus-within:shadow-[0_0_0_4px_rgba(107,38,217,0.10)]">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      event.target.style.height = "auto";
                      event.target.style.height = `${Math.min(event.target.scrollHeight, 168)}px`;
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSend(draft);
                      }
                    }}
                    placeholder={
                      isInBooking
                        ? "Type a message or skip..."
                        : "Ask about scope, budget, or timeline"
                    }
                    rows={1}
                    className="chat-composer-textarea max-h-[10.5rem] min-h-[2.75rem] min-w-0 flex-1 resize-none overflow-y-auto whitespace-pre-wrap border-0 bg-transparent py-3 text-sm leading-6 text-[color:var(--text-strong)] shadow-none outline-none ring-0 focus:border-transparent focus:shadow-none focus:outline-none focus:ring-0 focus:ring-transparent focus-visible:border-transparent focus-visible:shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent placeholder:text-[color:var(--text-faint)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => handleSend(draft)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface)] hover:text-[color:var(--primary)] disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={loading || !draft.trim()}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[color:var(--primary)] sm:hidden"
                >
                  Talk to {humanLabel} <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Launcher button ── */}
      <button
        type="button"
        onClick={() =>
          setOpen((current) => {
            const next = !current;
            if (next) {
              trackEvent({
                eventType: "chatbot_opened",
                siteSlug,
                page: window.location.pathname,
                source: "chatbot_launcher",
              });
            }
            return next;
          })
        }
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary)] text-white shadow-[0_18px_40px_rgba(107,38,217,0.24)] transition duration-200 hover:scale-[1.02]"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <MessageCircle size={24} />
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full border border-white/20 bg-white text-[10px] font-bold text-[color:var(--primary)]">
          AI
        </span>
      </button>
    </div>
  );
}
