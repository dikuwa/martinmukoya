import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getSiteBySlug, getCurrentSite } from "@/lib/sites";
import { createNotification } from "@/lib/notifications";
import { invalidateTag, tags } from "@/lib/cache";
import { sendLeadNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

const chatbotLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  service: z.string().trim().min(1, "Service is required"),
  description: z.string().trim().min(1, "Description is required"),
  budget: z.string().trim().optional().or(z.literal("")),
  budgetLabel: z.string().trim().optional().or(z.literal("")),
  timeline: z.string().trim().optional().or(z.literal("")),
  preferredContact: z.enum(["EMAIL", "PHONE", "WHATSAPP"]).optional().default("EMAIL"),
  businessName: z.string().trim().optional().or(z.literal("")),
  conversationSummary: z.string().trim().optional().or(z.literal("")),
  sessionId: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`rate:chatbot-leads:${ip}`, { limit: 5, windowSeconds: 60 * 60 });

    if (!limit.success) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = chatbotLeadSchema.parse(body);

    // Require at least email or phone
    if (!parsed.email && !parsed.phone) {
      return NextResponse.json(
        { error: "Email or phone is required." },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (parsed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Detect site — prefer chatbot's siteSlug from the request, fall back to server-side
    const siteSlug = typeof body?.siteSlug === "string" ? body.siteSlug : undefined;
    const site = siteSlug
      ? await getSiteBySlug(siteSlug)
      : await getCurrentSite();

    // Map service text to enum
    const serviceType = inferServiceType(parsed.service);

    // Build a human-readable project goal from the collected fields
    const projectGoal = [
      `Service: ${parsed.service}`,
      parsed.budgetLabel ? `Budget: ${parsed.budgetLabel}` : null,
      parsed.timeline ? `Timeline: ${parsed.timeline}` : null,
    ]
      .filter(Boolean)
      .join(". ");

    // Use email as placeholder if only phone was provided
    const email = parsed.email || `chatbot-${Date.now()}@lead.local`;

    // Insert the lead
    const lead = await db.lead.create({
      data: {
        siteId: site?.id,
        name: parsed.name,
        email,
        phone: parsed.phone || null,
        company: parsed.businessName || null,
        serviceType,
        budgetRange: parsed.budget || parsed.budgetLabel || null,
        timeline: parsed.timeline || null,
        projectGoal: projectGoal.slice(0, 300),
        message: parsed.description,
        source: "chatbot",
        preferredContact: parsed.preferredContact,
        status: "NEW",
        internalNotes: parsed.conversationSummary
          ? `Conversation summary: ${parsed.conversationSummary}`
          : null,
      },
    });

    // Link to chat session if provided
    if (parsed.sessionId) {
      await db.chatSession
        .update({
          where: { id: parsed.sessionId },
          data: {
            leadId: lead.id,
            handedToHuman: true,
            summary: parsed.conversationSummary?.slice(0, 200) ?? parsed.description.slice(0, 200),
          },
        })
        .catch(() => {
          // Session might not exist or already linked — ignore
        });
    }

    await invalidateTag(tags.leads);
    await invalidateTag(tags.dashboard);

    // Create notification
    await createNotification({
      siteId: site?.id ?? null,
      type: "lead",
      sourceId: lead.id,
      title: parsed.name,
      detail: `Chatbot lead — ${parsed.service}${parsed.budgetLabel ? `, ${parsed.budgetLabel}` : ""}`,
      href: `/admin/leads/${lead.id}`,
      createdAt: lead.createdAt,
    });

    // Send email notification (don't block the response)
    sendLeadNotification(lead).catch(() => {});

    return NextResponse.json(
      {
        success: true,
        lead: {
          id: lead.id,
          name: lead.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message ?? "Validation failed" },
        { status: 400 }
      );
    }
    console.error("[chatbot/leads] Error:", error);
    return NextResponse.json(
      { error: "I could not save your request right now. Please try again or contact us directly." },
      { status: 500 }
    );
  }
}

function inferServiceType(text: string) {
  const lower = text.toLowerCase();
  if (/\b(booking|appointment|schedule|reservation)\b/.test(lower)) return "BOOKING_SYSTEM";
  if (/\b(ecommerce|store|shop|checkout|payment|online.?store)\b/.test(lower)) return "ECOMMERCE";
  if (/\b(ai|automation|assistant|workflow|chatbot|agent)\b/.test(lower)) return "AI_AUTOMATION";
  if (/\b(website|web.?app|dashboard|portal|crm|system|application)\b/.test(lower)) return "WEB_APP";
  return "OTHER";
}
