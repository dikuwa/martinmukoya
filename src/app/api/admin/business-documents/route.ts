import { ok, created, serverError, parseJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { z } from "zod";
import { db } from "@/lib/db";
import { createBusinessDocument } from "@/lib/business-document-service";
import { trackServerEvent } from "@/lib/analytics";
import { BusinessDocumentStatus, BusinessDocumentType, Prisma } from "@/generated/prisma/client";

const createSchema = z.object({
  documentType: z.enum(BusinessDocumentType),
  title: z.string().trim().min(1).max(300),
  subject: z.string().trim().max(500).optional(),
  contactId: z.string().trim().optional().nullable(),
  leadId: z.string().trim().optional().nullable(),
  projectId: z.string().trim().optional().nullable(),
  financialDocumentId: z.string().trim().optional(),
  serviceId: z.string().optional(),
  templateId: z.string().trim().optional().nullable(),
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

    const where: Prisma.BusinessDocumentWhereInput = {};
    if (Object.values(BusinessDocumentType).includes(type as BusinessDocumentType)) where.documentType = type as BusinessDocumentType;
    if (Object.values(BusinessDocumentStatus).includes(status as BusinessDocumentStatus)) where.status = status as BusinessDocumentStatus;
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
    const templateId = input.templateId || undefined;
    const leadId = input.leadId || undefined;
    const projectId = input.projectId || undefined;
    const [template, lead, project, firstSite] = await Promise.all([
      templateId ? db.businessDocumentTemplate.findUnique({ where: { id: templateId } }) : null,
      leadId ? db.lead.findUnique({ where: { id: leadId } }) : null,
      projectId ? db.project.findUnique({ where: { id: projectId } }) : null,
      db.site.findFirst({ orderBy: { createdAt: "asc" } })
    ]);
    if (templateId && !template) return Response.json({ error: "The selected template no longer exists." }, { status: 400 });
    if (template && template.documentCategory !== input.documentType) {
      return Response.json({ error: "The selected template is not compatible with this document type." }, { status: 400 });
    }
    if (leadId && !lead) return Response.json({ error: "The selected lead no longer exists." }, { status: 400 });
    if (projectId && !project) return Response.json({ error: "The selected project no longer exists." }, { status: 400 });
    const templateSnapshot = template ? {
      id: template.id,
      name: template.name,
      documentCategory: template.documentCategory,
      defaultTitle: template.defaultTitle,
      defaultSubject: template.defaultSubject,
      defaultBodyMarkdown: template.defaultBodyMarkdown,
      signatureRequired: template.signatureRequired,
      senderName: template.senderName,
      senderRole: template.senderRole,
      updatedAt: template.updatedAt.toISOString()
    } : undefined;
    const doc = await createBusinessDocument({
      ...input,
      contactId: input.contactId || undefined,
      templateId,
      leadId,
      projectId,
      financialDocumentId: input.financialDocumentId || undefined,
      siteId: lead?.siteId || firstSite?.id,
      templateVersion: template ? 1 : undefined,
      templateSnapshot,
      userId: session.user.id
    });
    void trackServerEvent({
      eventType: "business_document_created",
      source: "admin-business-documents",
      metadata: { documentType: input.documentType, userId: session.user.id },
    }).catch(() => undefined);
    return created(doc);
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: error.issues[0]?.message || "Validation failed", issues: error.issues }, { status: 400 });
    const errorId = crypto.randomUUID();
    console.error("business_document.create failed", { errorId, error });
    return Response.json({ error: `Document could not be created. Please try again. Reference: ${errorId.slice(0, 8)}` }, { status: 500 });
  }
}
