import { ok, created, serverError, parseJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { z } from "zod";
import { db } from "@/lib/db";
import { BusinessDocumentType } from "@/generated/prisma/client";

const templateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  documentCategory: z.string().min(1),
  defaultTitle: z.string().trim().max(300).optional(),
  defaultSubject: z.string().trim().max(500).optional(),
  defaultBodyMarkdown: z.string().default(""),
  aiInstructions: z.string().max(5000).optional(),
  defaultTone: z.string().max(100).optional(),
  defaultStyle: z.string().max(100).optional(),
  defaultLength: z.string().max(100).optional(),
  signatureRequired: z.boolean().optional(),
  senderName: z.string().trim().max(200).optional(),
  senderRole: z.string().trim().max(200).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const templates = await db.businessDocumentTemplate.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return ok(templates);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const input = await parseJson(request, templateSchema);
    const template = await db.businessDocumentTemplate.create({
      data: { ...input,   documentCategory: input.documentCategory as BusinessDocumentType, createdById: session.user.id },
    });
    return created(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return serverError(error);
  }
}
