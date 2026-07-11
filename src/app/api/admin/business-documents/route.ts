import { ok, created, serverError, parseJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { z } from "zod";
import { db } from "@/lib/db";
import { createBusinessDocument } from "@/lib/business-document-service";
import { trackServerEvent } from "@/lib/analytics";

const createSchema = z.object({
  documentType: z.string().min(1),
  title: z.string().trim().min(1).max(300),
  subject: z.string().trim().max(500).optional(),
  contactId: z.string().optional(),
  leadId: z.string().optional(),
  projectId: z.string().optional(),
  serviceId: z.string().optional(),
  templateId: z.string().optional(),
  companyName: z.string().trim().max(200).optional(),
  recipientName: z.string().trim().max(200).optional(),
  recipientEmail: z.string().trim().max(300).optional(),
  recipientPhone: z.string().trim().max(50).optional(),
  recipientWhatsApp: z.string().trim().max(50).optional(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  reviewDate: z.string().optional().nullable(),
  contentMarkdown: z.string().default(""),
  internalNotes: z.string().max(5000).optional(),
  aiTone: z.string().max(100).optional(),
  aiStyle: z.string().max(100).optional(),
  aiLength: z.string().max(100).optional(),
  signatureRequired: z.boolean().optional(),
  senderName: z.string().trim().max(200).optional(),
  senderRole: z.string().trim().max(200).optional(),
});

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "";
    const status = url.searchParams.get("status") || "";
    const search = url.searchParams.get("search") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") || "50")));

    const where: Record<string, any> = {};
    if (type) where.documentType = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { documentNumber: { contains: search, mode: "insensitive" } },
        { recipientName: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [documents, total] = await Promise.all([
      db.businessDocument.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { publicShare: true, _count: { select: { auditLog: true } } },
      }),
      db.businessDocument.count({ where }),
    ]);

    return ok({ items: documents, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;
    const input = await parseJson(request, createSchema);
    const doc = await createBusinessDocument({ ...input, siteId: "pending", userId: session.user.id });
    void trackServerEvent({
      eventType: "business_document_created",
      source: "admin-business-documents",
      metadata: { documentType: input.documentType, userId: session.user.id },
    }).catch(() => undefined);
    return created(doc);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 });
    }
    return serverError(error);
  }
}
