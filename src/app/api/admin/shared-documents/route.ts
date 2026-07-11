import { ok, created, serverError } from "@/lib/api";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { createSharedDocumentLink, regenerateShareLink, revokeShareLink } from "@/lib/business-document-service";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "";
    const status = url.searchParams.get("status") || "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, parseInt(url.searchParams.get("pageSize") || "50"));

    const where: Record<string, any> = {};
    if (type === "financial" || type === "business") where.documentType = type;
    if (status === "expired") where.expiresAt = { lte: new Date() };
    else if (status === "active") where.shareEnabled = true;
    else if (status === "revoked") where.shareEnabled = false;

    const [shares, total] = await Promise.all([
      db.sharedDocument.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          financialDocument: { select: { number: true, type: true, status: true, customerName: true } },
          businessDocument: { select: { documentNumber: true, documentType: true, status: true, title: true, recipientName: true } },
        },
      }),
      db.sharedDocument.count({ where }),
    ]);

    return ok({ items: shares, pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    const body = await request.json();
    const { documentId, documentType } = body;
    if (!documentId || !documentType) {
      return Response.json({ error: "documentId and documentType are required" }, { status: 400 });
    }
    const result = await createSharedDocumentLink(documentId, documentType);
    return created(result);
  } catch (error) {
    return serverError(error);
  }
}
