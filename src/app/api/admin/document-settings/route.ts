import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  defaultSenderName: z.string().min(1).max(200),
  defaultSenderRole: z.string().max(200),
  defaultSignature: z.string().max(500),
  backdropEnabled: z.boolean(),
  defaultBusinessExpiryDays: z.number().int().min(1).max(365),
  defaultProposalValidity: z.number().int().min(1).max(365),
  defaultEmailSubject: z.string().max(500),
  defaultEmailBody: z.string().max(5000),
  defaultWhatsAppMsg: z.string().max(5000),
  aiDefaultTone: z.string().max(100),
  aiDefaultStyle: z.string().max(100),
  aiDefaultLength: z.string().max(100),
  acceptanceEnabled: z.boolean(),
});

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const settings = await db.documentSettings.findFirst();
    return NextResponse.json(settings || {
      defaultSenderName: "Martin Mukoya",
      defaultSenderRole: "Managing Director",
      defaultSignature: "",
      backdropEnabled: true,
      defaultBusinessExpiryDays: 30,
      defaultProposalValidity: 30,
      defaultEmailSubject: "Document {{documentNumber}} from FlexTech Media",
      defaultEmailBody: "Hello {{recipientName}},\n\nPlease find the document below.\n\n{{shareLink}}\n\nRegards,\n{{senderName}}",
      defaultWhatsAppMsg: "Good afternoon {{recipientName}},\n\nPlease find your document below:\n{{shareLink}}\n\nRegards,\n{{senderName}}",
      aiDefaultTone: "Professional",
      aiDefaultStyle: "Structured",
      aiDefaultLength: "Medium",
      acceptanceEnabled: true,
    });
  } catch (error) {
    console.error("[document-settings] GET error:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = settingsSchema.parse(body);
    const existing = await db.documentSettings.findFirst();

    if (existing) {
      await db.documentSettings.update({ where: { id: existing.id }, data: parsed });
    } else {
      await db.documentSettings.create({ data: parsed });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[document-settings] POST error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
