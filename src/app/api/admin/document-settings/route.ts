import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { z } from "zod";
import { defaultDocumentSettings } from "@/lib/document-settings";

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
    return NextResponse.json(settings || defaultDocumentSettings);
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

    const result = await db.$transaction(async (tx) => {
      if (existing) await tx.documentSettings.update({ where: { id: existing.id }, data: parsed });
      else await tx.documentSettings.create({ data: parsed });
      return tx.businessDocument.updateMany({
        data: {
          senderName: parsed.defaultSenderName,
          senderRole: parsed.defaultSenderRole,
          aiTone: parsed.aiDefaultTone,
          aiStyle: parsed.aiDefaultStyle,
          aiLength: parsed.aiDefaultLength
        }
      });
    });

    return NextResponse.json({ saved: true, documentsUpdated: result.count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    console.error("[document-settings] POST error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
