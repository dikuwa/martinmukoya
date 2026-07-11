import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trackSharedDocumentView } from "@/lib/business-document-service";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ code: string }> };

export async function GET(request: Request, context: Context) {
  // Rate limit: 20 views per minute per IP
  const ip = getClientIp(request);
  const { success } = await rateLimit(`share:view:${ip}`, { limit: 20, windowSeconds: 60 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const code = (await context.params).code;
    const share = await db.sharedDocument.findUnique({
      where: { shortCode: code },
      include: {
        financialDocument: {
          include: { booking: true, lineItems: { orderBy: { sortOrder: "asc" } }, payments: true, receiptForPayment: true },
        },
        businessDocument: {
          include: { template: true, auditLog: { orderBy: { createdAt: "desc" }, take: 5 } },
        },
      },
    });

    if (!share || !share.shareEnabled || (share.expiresAt && share.expiresAt < new Date())) {
      return NextResponse.json({ error: "Document not found or link has expired." }, { status: 404 });
    }

    // Track view asynchronously - avoid counting rapid refreshes
    void trackSharedDocumentView(code).catch(() => undefined);

    const response: Record<string, unknown> = {
      shortCode: share.shortCode,
      documentType: share.documentType,
      shareEnabled: share.shareEnabled,
      expiresAt: share.expiresAt,
      viewedAt: share.lastViewedAt,
      viewCount: share.viewCount,
      accepted: !!share.acceptedAt,
      declined: !!share.declinedAt,
    };

    if (share.documentType === "financial" && share.financialDocument) {
      const doc = share.financialDocument;
      response.document = {
        type: "financial",
        number: doc.number,
        documentType: doc.type,
        status: doc.status,
        customerName: doc.customerName,
        issuedAt: doc.issuedAt,
        total: String(doc.total),
        currency: doc.currency,
        issuerSnapshot: doc.issuerSnapshot,
      };
      response.previewUrl = `/api/documents/share/${code}/download`;
    } else if (share.documentType === "business" && share.businessDocument) {
      const doc = share.businessDocument;
      response.document = {
        type: "business",
        number: doc.documentNumber,
        documentType: doc.documentType,
        status: doc.status,
        title: doc.title,
        subject: doc.subject,
        recipientName: doc.recipientName,
        companyName: doc.companyName,
        issueDate: doc.issueDate,
        expiryDate: doc.expiryDate,
        contentMarkdown: doc.contentMarkdown,
        senderName: doc.senderName,
        signatureRequired: doc.signatureRequired,
        accepted: !!doc.acceptedAt,
        declined: !!doc.declinedAt,
        canAccept: !doc.acceptedAt && !doc.declinedAt && doc.status !== "REVOKED",
      };
      response.previewUrl = `/api/documents/share/${code}/download`;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[share] Error fetching shared document:", error);
    return NextResponse.json({ error: "Document not available." }, { status: 500 });
  }
}
