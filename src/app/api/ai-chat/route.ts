import { PreferredContact, ServiceType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { trackServerEvent } from "@/lib/analytics";
import { invalidateTag, tags } from "@/lib/cache";
import { sendLeadNotification, sendVisitorConfirmation } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getCurrentSite } from "@/lib/sites";

// Basic content guardrails (simple black-list). For production replace with moderation API.
const FORBIDDEN_RE = /\b(bomb|kill|terror|explosive|suicide|rape|child abuse)\b/i;
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function buildSystemPrompt(siteSlug?: string | null): string {
  if (siteSlug === "flextech-media") {
    return `You are the website assistant for FlexTech Media, a digital media and technology agency.
You help visitors understand agency services, shape a campaign brief, and choose the best next contact path.

Services to discuss:
- Brand websites and campaign landing pages
- Content systems and media publishing workflows
- Analytics and tracking dashboards
- Lead capture and enquiry management
- AI automations and workflow integrations

Rules:
- Be clear, warm, concise, and action-oriented.
- Do not pretend to be a human agent. You are an assistant that can help route the visitor to the FlexTech team.
- Do not guarantee exact prices, timelines, rankings, revenue, or outcomes. Give ranges only when the visitor asks.
- Do not take external actions, make calls, send messages, or promise that a team member has already responded.
- If the visitor wants pricing, timeline, booking, a consultation, WhatsApp, or a human handover, ask for their email or suggest using the Start Project form or WhatsApp.
- Ask at most one useful follow-up question at a time.
- Keep replies under 120 words unless the visitor asks for detail.`;
  }

  return `You are the website assistant for Martin Mukoya, a practical business-systems developer in Namibia.
You help visitors understand services, shape a short project brief, and choose the best next contact path.

Services to discuss:
- Web applications and business dashboards
- Booking and appointment systems
- Ecommerce flows and online storefronts
- AI automations and workflow integrations

Rules:
- Be clear, warm, concise, and action-oriented.
- Do not pretend to be Martin or a human. You are an assistant that can help route the visitor to Martin.
- Do not guarantee exact prices, timelines, rankings, revenue, or outcomes. Give ranges only when the visitor asks and explain that Martin confirms after scope.
- Do not take external actions, make calls, send messages, or promise that Martin has already responded.
- If the visitor wants pricing, timeline, booking, a consultation, WhatsApp, or a human handover, ask for their email or suggest using the Start Project form or WhatsApp.
- Ask at most one useful follow-up question at a time.
- Keep replies under 120 words unless the visitor asks for detail.`;
}

function fallbackAssistantReply(content: string, siteSlug?: string | null): string {
  const lower = content.toLowerCase();
  const isFlexTech = siteSlug === "flextech-media";
  const brandName = isFlexTech ? "FlexTech Media" : "Martin Mukoya";
  const handover = isFlexTech
    ? "If you need the fastest handoff, tap the Human button and continue on WhatsApp with the FlexTech team."
    : "If you want the fastest handoff, tap the Human button and continue on WhatsApp with Martin.";
  const servicesList = isFlexTech
    ? "brand websites, campaign pages, content systems, analytics, and AI automations"
    : "websites, booking systems, ecommerce flows, dashboards, and practical AI automations";
  const serviceQuestion = isFlexTech
    ? "What are you trying to launch or improve first: brand presence, campaign pages, content workflow, or lead capture?"
    : "What are you trying to improve first: leads, bookings, sales, or internal workflow?";

  if (/\btimeline|time|deadline|how long|launch\b/.test(lower)) {
    return `A practical ${isFlexTech ? "project" : "timeline"} depends on scope. A focused ${isFlexTech ? "brand site or campaign page" : "website"} can move faster while ${isFlexTech ? "content systems, analytics dashboards, and automations" : "booking systems, ecommerce, dashboards, and AI workflows"} need more planning and testing. ${handover}`;
  }

  if (/\bbudget|price|cost|quote|pricing|money\b/.test(lower)) {
    return `Budget depends on the service, integrations, content, and urgency. The safest next step is to share the service you need${isFlexTech ? ", your campaign type," : ""} your rough budget range, and what success should look like. ${handover}`;
  }

  if (/\bservice|website|booking|ecommerce|shop|ai|automation|dashboard|system|campaign|brand|content\b/.test(lower)) {
    return `I can help you shape this into a clearer brief. ${brandName} usually works around ${servicesList}. ${serviceQuestion}`;
  }

  if (/\bhuman|martin|flextech|whatsapp|contact|call|handoff|hand off\b/.test(lower)) {
    return `Sure. The quickest route is WhatsApp so ${isFlexTech ? "the FlexTech team" : "Martin"} can see the context and reply directly. Tap the Human button at the top of this chat.`;
  }

  return `I can help you choose a service, shape a ${isFlexTech ? "campaign brief" : "project brief"}, or find the quickest way to reach ${isFlexTech ? "the FlexTech team" : "Martin"}. Tell me what you want to build or improve, and I'll help narrow the next step. ${handover}`;
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

async function streamAndSaveFallback(sessionId: string, content: string, reply: string) {
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
    data: { sessionId, role: "ASSISTANT", content: reply }
  });
  await invalidateTag(tags.chatSessions);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Chat-Session-Id": sessionId,
      "X-Assistant-Fallback": content ? "true" : "empty"
    }
  });
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
    const detectedSite = await getCurrentSite();
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
        handedToHuman: shouldHandToHuman
      }
    });

    await db.chatMessage.create({
      data: {
        sessionId: activeSession.id,
        role: "USER",
        content
      }
    });

    const sharedEmail = content.match(EMAIL_RE)?.[0];
    let capturedLead = false;
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
          handedToHuman: true,
          summary: activeSession.summary ?? content.slice(0, 180)
        }
      });
      await invalidateTag(tags.leads);
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
      capturedLead = true;
    }

    if (session) {
      await db.chatSession.update({
        where: { id: activeSession.id },
        data: {
          summary: activeSession.summary ?? content.slice(0, 180),
          handedToHuman: activeSession.handedToHuman || shouldHandToHuman || capturedLead
        }
      });
    }

    await invalidateTag(tags.chatSessions);
    await invalidateTag(tags.dashboard);

    // If OpenAI key not present, fall back to simple canned reply streaming
    const OPENAI_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_KEY) {
      return streamAndSaveFallback(activeSession.id, content, fallbackAssistantReply(content, activeSiteSlug));
    }

    const recentMessages = await db.chatMessage.findMany({
      where: { sessionId: activeSession.id },
      orderBy: { createdAt: "asc" },
      take: 10
    });

    // Call OpenAI streaming API with site-aware system prompt
    const systemPrompt = buildSystemPrompt(activeSiteSlug);
    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages.map((message) => ({
            role: message.role === "ASSISTANT" ? "assistant" : "user",
            content: message.content
          }))
        ],
        max_tokens: 800,
        temperature: 0.2,
        stream: true
      })
    });

    if (!openAiRes.ok || !openAiRes.body) {
      console.error("OpenAI chat completion unavailable", { status: openAiRes.status });
      return streamAndSaveFallback(activeSession.id, content, fallbackAssistantReply(content, activeSiteSlug));
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // stream assistant tokens to client and accumulate to persist
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openAiRes.body!.getReader();
        let assistantText = "";
        let done = false;

        try {
          while (!done) {
            const { value, done: rdone } = await reader.read();
            done = !!rdone;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              // OpenAI SSE stream emits lines like 'data: {...}\n\n'
              for (const line of chunk.split(/\n/)) {
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
            await db.chatMessage.create({ data: { sessionId: activeSession.id, role: "ASSISTANT", content: assistantText } });
            await invalidateTag(tags.chatSessions);
            await invalidateTag(tags.dashboard);
          } catch (error) {
            console.error("Failed to persist assistant message", error);
          }
        }
      }
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Chat-Session-Id": activeSession.id } });
  } catch (err) {
    console.error("ai-chat route error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500 });
  }
}
