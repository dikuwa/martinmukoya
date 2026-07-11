import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { z } from "zod";

type Context = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  // documentCategory is an enum; we preserve it from the existing template
  defaultTitle: z.string().trim().max(300).optional(),
  defaultSubject: z.string().trim().max(500).optional(),
  defaultBodyMarkdown: z.string().optional(),
  aiInstructions: z.string().max(5000).optional().nullable(),
  requiredSections: z.array(z.string()).optional(),
  optionalSections: z.array(z.string()).optional(),
  defaultTone: z.string().max(100).optional(),
  defaultStyle: z.string().max(100).optional(),
  defaultLength: z.string().max(100).optional(),
  signatureRequired: z.boolean().optional(),
  senderName: z.string().trim().max(200).optional().nullable(),
  senderRole: z.string().trim().max(200).optional().nullable(),
  defaultEmailSubject: z.string().max(500).optional().nullable(),
  defaultEmailBody: z.string().max(2000).optional().nullable(),
  defaultWhatsAppMsg: z.string().max(2000).optional().nullable(),
  headerFooterEnabled: z.boolean().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(_request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const template = await db.businessDocumentTemplate.findUnique({ where: { id: (await context.params).id } });
    if (!template) return Response.json({ error: "Template not found" }, { status: 404 });
    return ok(template);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const input = await request.json();
    const parsed = updateSchema.parse(input);
    const template = await db.businessDocumentTemplate.update({
      where: { id: (await context.params).id },
      data: parsed,
    });
    return ok(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    await db.businessDocumentTemplate.delete({ where: { id: (await context.params).id } });
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
