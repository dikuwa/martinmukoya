import { PreferredContact, ServiceType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { trackServerEvent } from "@/lib/analytics";
import { invalidateTag, tags } from "@/lib/cache";
import { createNotification } from "@/lib/notifications";
import { sendLeadNotification, sendVisitorConfirmation } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentSite } from "@/lib/sites";
import { getSiteBySlug } from "@/lib/sites";
import { newVisitorToken, requestHuman } from "@/lib/live-chat";

// Basic content guardrails (simple black-list). For production replace with moderation API.
const FORBIDDEN_RE = /\b(bomb|kill|terror|explosive|suicide|rape|child abuse)\b/i;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function buildSystemPrompt(siteSlug?: string | null): string {
  const baseLeadCapture = `
LEAD CAPTURE RULES:
When a visitor shows buying intent (e.g. asks about services, pricing, timeline, or wants to build something), the chat interface will guide them through a sequential project booking flow.

The flow is driven entirely by interactive components in the chat. The visitor:
1. Selects one or more services from a list (via ServiceSelector component)
2. Selects a budget range from clickable cards (via BudgetSelector component)
3. Selects a timeline from clickable cards (via TimelineSelector component)
4. Fills in their contact details (name, email/phone, company, project description)
5. Reviews everything and submits

The visitor can also click quick-start options from the start page:
- "Choose a service" → starts the booking flow at step 1
- "Ask a question" → normal chat mode (no booking flow)
- "Budget guidance" → you explain budget ranges generally, then ask if they'd like to start with services
- "Talk to Human" → starts the booking flow for a handover

BUYER INTENT & SERVICE SUGGESTIONS:
When a visitor asks about services, pricing, or what you do (e.g. "i need a website", "what services do you offer", "can you help my business"):
- Respond conversationally and naturally — show genuine interest in what they need.
- Briefly mention that you can help with the relevant services.
- End your response with a natural invitation like "Which of these sounds closest to what you're looking for?" or "Take a look below and pick the option that fits best — I'll guide you from there."
- The chat interface will automatically show a selection card with service options after your response. Do not list services yourself — the card handles that.

Your role during the booking flow:
- Guide the visitor naturally between steps. Confirm their choices warmly.
- If the visitor asks a question during the flow, answer it and gently guide them back.
- Never redirect to a form or external page.
- If the visitor asks about budget guidance generically (not in booking flow), explain the ranges:
  • Under N\$15,000 — Simple website or landing page
  • N\$15,000 – N\$50,000 — Custom website or web app
  • N\$50,000 – N\$100,000 — Complex platform or system
  • N\$100,000+ — Enterprise solution or full platform
  Then ask if they'd like to choose a service for a more tailored recommendation.
- When a visitor seems unsure, suggest they start with "Choose a service" from the start options.
- Once the booking is submitted, the chat shows a confirmation. You can answer follow-up questions.

Normal chat rules (when not in booking flow):
- Answer naturally
- Do not force the booking flow
- Do not collect lead details too early
- Allow the visitor to keep chatting normally
`;

  if (siteSlug === "flextech-media") {
    return `You are the friendly website assistant for FlexTech Media, a digital media and technology agency in Namibia.
Your job is to help visitors explore services, shape a campaign idea, or get them to the right person on the team.

Services to discuss:
- Brand websites and campaign landing pages
- Content systems and media publishing workflows
- Analytics and tracking dashboards
- Lead capture and enquiry management
- AI automations and workflow integrations

Personality:
- Sound like a helpful teammate who genuinely wants to see the visitor succeed.
- Use natural, conversational language. Throw in the occasional "great question" or "love that" when it fits.
- Be proactive — if someone mentions a goal, suggest one or two relevant services without overwhelming them.
- Keep it real: share honest ballpark ranges, never overpromise.

Rules:
- Do not pretend to be a human agent. You are an assistant that can help route the visitor to the FlexTech team.
- Do not guarantee exact prices, timelines, rankings, revenue, or outcomes.
- If the visitor wants pricing, timeline, a consultation, WhatsApp, or a human handover, ask for their email or point them to the Start Project form.
- Ask at most one follow-up question at a time.
- Keep replies under 120 words unless the visitor asks for detail.
- Use simple formatting: **bold** for emphasis, dashes for lists — keep it clean and scannable.
${baseLeadCapture}`;
  }

  return `You are the friendly website assistant for Martin Mukoya, a practical business-systems developer based in Namibia.
Your job is to help visitors understand services, shape a project brief, and get them connected with Martin when they're ready.

Services to discuss:
- Web applications and business dashboards
- Booking and appointment systems
- Ecommerce flows and online storefronts
- AI automations and workflow integrations

Personality:
- Sound like a warm, knowledgable colleague who's excited to help visitors build something great.
- Write like you talk — natural and conversational. Use phrases like "here's the thing" or "that's a solid idea" when it feels right.
- When someone shares what they're working on, show genuine interest and offer focused next steps.
- Be honest about what's possible; give ballpark ranges, never hard promises.

Rules:
- Do not pretend to be Martin or a human. You are an assistant that routes visitors to Martin.
- Do not guarantee exact prices, timelines, rankings, revenue, or outcomes.
- If the visitor wants pricing, timeline, a consultation, WhatsApp, or to speak with Martin, ask for their email or point them to the Start Project form.
- Ask at most one follow-up question at a time.
- Keep replies under 120 words unless the visitor asks for detail.
- Use simple formatting: **bold** for emphasis, dashes for lists — keep it clean and scannable.
${baseLeadCapture}`;
}

function fallbackAssistantReply(content: string, siteSlug?: string | null): string {
  const lower = content.toLowerCase();
  const isFlexTech = siteSlug === "flextech-media";
  const contactLabel = isFlexTech ? "the FlexTech team" : "Martin";
  const handoverLine = isFlexTech
    ? "If you need to speak with someone directly, tap the Team button at the top of the chat."
    : "If you'd like to talk to Martin directly, tap the Human button at the top of the chat.";

  // Direct handover requests — warm, immediate, no extra questions
  if (/\bhuman|martin|flextech|whatsapp|contact|call|talk to|handoff|hand off\b/.test(lower)) {
    return `Sure! The quickest way to reach ${contactLabel} is WhatsApp — it lets ${isFlexTech ? "the team" : "Martin"} see the full context and reply directly. Just tap the ${isFlexTech ? "Team" : "Human"} button at the top of this chat.`;
  }

  // Timeline questions
  if (/\btimeline|time|deadline|how long|launch\b/.test(lower)) {
    const fast = isFlexTech ? "a brand site or campaign page" : "a focused website";
    const slow = isFlexTech
      ? "content systems, analytics dashboards, or automations"
      : "booking systems, ecommerce, dashboards, or AI workflows";
    return `Timelines depend on scope, but here's a rough guide: ${fast} can move quickly (a few weeks), while ${slow} typically need more discovery and testing. Happy to help narrow it down if you share what you're trying to build. ${handoverLine}`;
  }

  // Budget / pricing questions
  if (/\bbudget|price|cost|quote|pricing|money|how much\b/.test(lower)) {
    const details = isFlexTech ? "your campaign type, rough range, and what success looks like" : "the service you need, a rough budget range, and what the outcome should look like";
    return `Every project is a bit different depending on integrations, content, and urgency. The most useful next step is to share ${details} — that gives enough context for a realistic ballpark. ${handoverLine}`;
  }

  // Service enquiry
  if (/\bservice|website|booking|ecommerce|shop|ai|automation|dashboard|system|campaign|brand|content|build|create\b/.test(lower)) {
    if (isFlexTech) {
      return `Great choice. FlexTech works on brand websites, campaign pages, content systems, analytics, and automations. To help shape a clearer brief — are you looking to launch something new, improve an existing system, or build a campaign around a specific offer?`;
    }
    return `Nice. Martin builds things like websites, booking systems, ecommerce flows, dashboards, and AI automations. To help narrow it down — are you looking to improve leads, bookings, sales, or an internal workflow?`;
  }

  // Everything else — open, friendly invitation
  if (isFlexTech) {
    return `I'm here to help you explore FlexTech's services, shape a campaign idea, or connect you with the team. What are you hoping to launch or improve?`;
  }
  return `I'm here to help you figure out the right service, shape a project brief, or connect you directly with Martin. What are you trying to build or improve?`;
}

function inferServiceType(content: string) {
  if (/\bbooking|appointment|schedule|reservation\b/i.test(content)) return ServiceType.BOOKING_SYSTEM;
  if (/\becommerce|store|shop|checkout|payment\b/i.test(content)) return ServiceType.ECOMMERCE;
  if (/\bai|automation|automate|assistant|workflow\b/i.test(content)) return ServiceType.AI_AUTOMATION;
  if (/\bwebsite|web app|dashboard|portal|system\b/i.test(content)) return ServiceType.WEB_APP;
  return ServiceType.OTHER;
}

function inferPreferredContact(content: string) {
  if (/\bwhatsapp\b/i.test(content)) return PreferredContact.WHATSAPP;
  if (/\bcall|phone\b/i.test(content)) return PreferredContact.PHONE;
  return PreferredContact.EMAIL;
}

async function streamAndSaveFallback(sessionId: string, token: string, content: string, reply: string) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const chunkSize = 60;
      for (let i = 0; i < reply.length; i += chunkSize) {
        controller.enqueue(encoder.encode(reply.slice(i, i + chunkSize)));
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      controller.close();
    }
  });

  await db.chatMessage.create({
    data: { sessionId, role: "AI", content: reply }
  });
  await invalidateTag(tags.chatSessions);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Chat-Session-Id": sessionId,
      "X-Chat-Visitor-Token": token,
      "X-Assistant-Fallback": content ? "true" : "empty"
    }
  });
}

async function readApiError(response: Response) {
  try {
    const payload = await response.json();
    const error = payload?.error ?? {};
    return {
      message: typeof error.message === "string" ? error.message : "AI provider request failed.",
      code: typeof error.code === "string" ? error.code : undefined,
      type: typeof error.type === "string" ? error.type : undefined
    };
  } catch {
    return { message: "AI provider request failed." };
  }
}

function publicApiErrorMessage() {
  return "The AI assistant is temporarily unavailable. Please try again later, or use the contact form to get in touch directly.";
}

type AIProvider = "openrouter" | "openai";

function getProviderConfig(): {
  provider: AIProvider | null;
  endpoint: string;
  apiKey: string;
  model: string;
  extraHeaders: Record<string, string>;
} {
  const openAIKey = process.env.OPENAI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (openAIKey) {
    return {
      provider: "openai",
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: openAIKey,
      model: process.env.OPENAI_MODEL || "gpt-4o",
      extraHeaders: {}
    };
  }

  if (openRouterKey) {
    return {
      provider: "openrouter",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openRouterKey,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      extraHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "https://martinmukoya.com",
        "X-Title": process.env.SITE_NAME || "Martin Mukoya"
      }
    };
  }

  return {
    provider: null,
    endpoint: "",
    apiKey: "",
    model: "",
    extraHeaders: {}
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const content: string = (body?.content || "").toString();
    const requestedSessionId = typeof body?.sessionId === "string" ? body.sessionId : undefined;
    const clientSiteSlug = typeof body?.siteSlug === "string" ? body.siteSlug : undefined;

    // quick guardrails
    if (!content || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Empty message" }), { status: 400 });
    }

    if (content.length > 5000) {
      return new Response(JSON.stringify({ error: "Message too long" }), { status: 400 });
    }

    if (FORBIDDEN_RE.test(content)) {
      return new Response(JSON.stringify({ error: "Message contains disallowed content" }), { status: 400 });
    }

    // rate limit per IP
    const ip = getClientIp(req);
    const rl = await rateLimit(`ai-chat:${ip}`, { limit: 30, windowSeconds: 60 });
    if (!rl.success) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 });
    }

    // Detect site — prefer client-provided slug, fall back to server-side detection
    const detectedSite = clientSiteSlug ? await getSiteBySlug(clientSiteSlug) : await getCurrentSite();
    const activeSiteSlug = clientSiteSlug || detectedSite?.slug;
    const isFlexTech = activeSiteSlug === "flextech-media";

    // Build site-aware handover regex
    const handoverRe = isFlexTech
      ? /\b(human|flextech|call|whatsapp|contact|handoff|hand off|talk to flextech|talk to the team)\b/i
      : /\b(human|martin|call|whatsapp|contact|handoff|hand off|talk to martin)\b/i;

    const shouldHandToHuman = handoverRe.test(content);
    const site = detectedSite;
    const session = requestedSessionId
      ? await db.chatSession.findUnique({ where: { id: requestedSessionId } })
      : null;
    const activeSession = session ?? await db.chatSession.create({
      data: {
        siteId: site?.id,
        summary: content.slice(0, 180),
        visitorToken: newVisitorToken()
      }
    });

    await db.chatMessage.create({
      data: {
        sessionId: activeSession.id,
        role: "VISITOR",
        content
      }
    });

    const sharedEmail = content.match(EMAIL_RE)?.[0];
    if (sharedEmail && !activeSession.leadId) {
      const lead = await db.lead.create({
        data: {
          name: "Chat visitor",
          siteId: site?.id,
          email: sharedEmail,
          serviceType: inferServiceType(content),
          projectGoal: `AI chat handover: ${content.slice(0, 160)}`,
          message: content,
          source: "ai-chat",
          preferredContact: inferPreferredContact(content),
          status: "NEW"
        }
      });
      await db.chatSession.update({
        where: { id: activeSession.id },
        data: {
          leadId: lead.id,
          mode: shouldHandToHuman ? "WAITING_FOR_HUMAN" : activeSession.mode,
          summary: activeSession.summary ?? content.slice(0, 180)
        }
      });
      await invalidateTag(tags.leads);

      // Create notification immediately so the bell icon shows it on next fetch
      await createNotification({
        siteId: site?.id ?? null,
        type: "lead",
        sourceId: lead.id,
        title: lead.name,
        detail: lead.projectGoal.slice(0, 120),
        href: `/admin/leads/${lead.id}`,
        createdAt: lead.createdAt
      });

      await Promise.allSettled([
        trackServerEvent({
          eventType: "ai_handover",
          siteId: site?.id,
          siteSlug: site?.slug,
          page: "chat_widget",
          source: "ai-chat",
          metadata: { chatSessionId: activeSession.id, leadId: lead.id, serviceType: lead.serviceType }
        }),
        sendLeadNotification(lead),
        sendVisitorConfirmation({ name: lead.name, email: lead.email, kind: "lead" })
      ]);
    }

    if (session) {
      await db.chatSession.update({
        where: { id: activeSession.id },
        data: {
          summary: activeSession.summary ?? content.slice(0, 180),
          mode: shouldHandToHuman ? "WAITING_FOR_HUMAN" : activeSession.mode
        }
      });
    }

    if (activeSession.mode === "HUMAN") {
      return Response.json({ error: "This conversation is currently handled by a person." }, { status: 409 });
    }

    if (shouldHandToHuman && activeSession.mode === "AI") {
      const handover = await requestHuman(activeSession.id, detectedSite);
      return new Response(handover.content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Chat-Session-Id": activeSession.id,
          "X-Chat-Visitor-Token": activeSession.visitorToken,
          "X-Chat-Mode": "WAITING_FOR_HUMAN"
        }
      });
    }

    await invalidateTag(tags.chatSessions);
    await invalidateTag(tags.dashboard);

    // Determine AI provider — prefer OpenAI, fall back to OpenRouter
    const config = getProviderConfig();

    if (!config.provider) {
      return streamAndSaveFallback(activeSession.id, activeSession.visitorToken, content, fallbackAssistantReply(content, activeSiteSlug));
    }

    const recentMessages = await db.chatMessage.findMany({
      where: { sessionId: activeSession.id },
      orderBy: { createdAt: "asc" },
      take: 10
    });

    // Call the AI provider's streaming API with site-aware system prompt
    const systemPrompt = buildSystemPrompt(activeSiteSlug);

    const aiRes = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        ...config.extraHeaders
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages.map((message) => ({
            role: message.role === "AI" ? "assistant" : "user",
            content: message.content
          }))
        ],
        max_tokens: 800,
        temperature: 0.2,
        stream: true
      })
    });

    if (!aiRes.ok || !aiRes.body) {
      const apiError = await readApiError(aiRes);
      console.error(`${config.provider} chat completion unavailable`, {
        status: aiRes.status,
        code: apiError.code,
        type: apiError.type,
        message: apiError.message
      });
      const errorMessage = publicApiErrorMessage();
      await db.chatMessage.create({
        data: { sessionId: activeSession.id, role: "AI", content: errorMessage }
      });
      await invalidateTag(tags.chatSessions);
      await invalidateTag(tags.dashboard);

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "X-Chat-Session-Id": activeSession.id,
          "X-Chat-Visitor-Token": activeSession.visitorToken,
          "X-Assistant-Provider": `${config.provider}-error`
        }
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // stream assistant tokens to client and accumulate to persist
    const stream = new ReadableStream({
      async start(controller) {
        const reader = aiRes.body!.getReader();
        let assistantText = "";
        let done = false;
        let buffer = "";

        try {
          while (!done) {
            const { value, done: rdone } = await reader.read();
            done = !!rdone;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              // SSE stream emits lines like 'data: {...}\n\n'
              const lines = buffer.split(/\n/);
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                if (trimmed === "data: [DONE]") {
                  // end
                  done = true;
                  break;
                }
                const part = trimmed.replace(/^data: /, "");
                try {
                  const parsed = JSON.parse(part);
                  const delta = parsed.choices?.[0]?.delta?.content;
                  if (delta) {
                    assistantText += delta;
                    controller.enqueue(encoder.encode(delta));
                  }
                } catch {
                  // not json — ignore
                }
              }
            }
          }
        } catch (err) {
          console.error("stream read error", err);
        } finally {
          controller.close();
          // persist the assistant message
          try {
            await db.chatMessage.create({ data: { sessionId: activeSession.id, role: "AI", content: assistantText } });
            await invalidateTag(tags.chatSessions);
            await invalidateTag(tags.dashboard);
          } catch (error) {
            console.error("Failed to persist assistant message", error);
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Chat-Session-Id": activeSession.id,
        "X-Chat-Visitor-Token": activeSession.visitorToken,
        "X-Assistant-Provider": config.provider
      }
    });
  } catch (err) {
    console.error("ai-chat route error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}
