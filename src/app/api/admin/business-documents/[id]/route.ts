import { ok, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { updateBusinessDocument } from "@/lib/business-document-service";
import { z } from "zod";
import { BusinessDocumentType } from "@/generated/prisma/client";

type Context = { params: Promise<{ id: string }> };

const updateSchema = z.object({
  documentType: z.enum(BusinessDocumentType).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  subject: z.string().trim().max(500).optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  projectId: z.string().optional(),
  financialDocumentId: z.string().optional(),
  serviceId: z.string().optional(),
  templateId: z.string().optional(),
  companyName: z.string().trim().max(200).optional(),
  recipientName: z.string().trim().max(200).optional(),
  recipientEmail: z.string().trim().max(300).optional(),
  recipientPhone: z.string().trim().max(50).optional(),
  recipientWhatsApp: z.string().trim().max(50).optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  reviewDate: z.string().optional(),
  contentMarkdown: z.string().optional(),
  internalNotes: z.string().max(5000).optional(),
  aiTone: z.string().max(100).optional(),
  aiStyle: z.string().max(100).optional(),
  aiLength: z.string().max(100).optional(),
  signatureRequired: z.boolean().optional(),
  senderName: z.string().trim().max(200).optional(),
  senderRole: z.string().trim().max(200).optional(),
});

export async function GET(_request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const id = (await context.params).id;
    const doc = await db.businessDocument.findUnique({
      where: { id },
      include: {
        publicShare: true,
        auditLog: { orderBy: { createdAt: "desc" }, take: 50 },
        template: true,
        revisionOf: { select: { id: true, documentNumber: true, title: true } },
      },
    });
    if (!doc) return Response.json({ error: "Document not found" }, { status: 404 });
    return ok(doc);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const id = (await context.params).id;
    const existing = await db.businessDocument.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: "Document not found" }, { status: 404 });
    if (existing.status !== "DRAFT") return Response.json({ error: "Only draft documents can be edited." }, { status: 409 });
    const input = await request.json();
    const parsed = updateSchema.parse(input);
    const result = await updateBusinessDocument(id, { ...parsed, userId: session.user.id });
    return ok(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return serverError(error);
  }
}
