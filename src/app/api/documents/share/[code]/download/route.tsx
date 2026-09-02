import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { trackSharedDocumentDownload } from "@/lib/business-document-service";
import { FinancialPdf } from "@/lib/pdf/financial-document";
import { BusinessDocumentPdf } from "@/lib/pdf/business-document";
import { getIssuerSnapshot } from "@/lib/finance-service";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Context = { params: Promise<{ code: string }> };

export const runtime = "nodejs";

export async function GET(request: Request, context: Context) {
  // Rate limit: 10 downloads per minute per IP
  const ip = getClientIp(request);
  const { success } = await rateLimit(`share:download:${ip}`, { limit: 10, windowSeconds: 60 });
  if (!success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  try {
    const code = (await context.params).code;
    const share = await db.sharedDocument.findUnique({ where: { shortCode: code } });

    if (!share || !share.shareEnabled || (share.expiresAt && share.expiresAt < new Date())) {
      return NextResponse.json({ error: "Document not found or link has expired." }, { status: 404 });
    }

    void trackSharedDocumentDownload(code).catch(() => undefined);
    const baseUrl = new URL(request.url).origin;

    if (share.documentType === "financial" && share.financialDocumentId) {
      const document = await db.financialDocument.findUnique({
        where: { id: share.financialDocumentId },
        include: { booking: true, lineItems: { orderBy: { sortOrder: "asc" } }, payments: true, receiptForPayment: true },
      });
      if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

      const buffer = await renderToBuffer(<FinancialPdf document={document} baseUrl={baseUrl} />);
      const filename = `${(document.number || "draft").replace(/[^a-z0-9-]/gi, "_")}.pdf`;
      return new Response(new Uint8Array(buffer), {
        headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "private, no-store" },
      });
    }

    if (share.documentType === "business" && share.businessDocumentId) {
      const doc = await db.businessDocument.findUnique({ where: { id: share.businessDocumentId } });
      if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

      const issuer = await getIssuerSnapshot(doc.siteId ?? null);
      const buffer = await renderToBuffer(
        <BusinessDocumentPdf
          title={doc.title}
          documentNumber={doc.documentNumber}
          documentType={doc.documentType}
          subject={doc.subject}
          recipientName={doc.recipientName}
          companyName={doc.companyName}
          recipientEmail={doc.recipientEmail}
          issueDate={doc.issueDate?.toISOString() || null}
          expiryDate={doc.expiryDate?.toISOString() || null}
          contentMarkdown={doc.contentMarkdown}
          senderName={doc.senderName}
          senderRole={doc.senderRole}
          baseUrl={baseUrl}
          issuerLogo={issuer.logo}
          issuerName={issuer.name}
          issuerDetails={issuer.companyDetails}
          issuerPhone={issuer.phone}
          issuerEmail={issuer.email}
        />
      );

      const filename = `${(doc.documentNumber || "document").replace(/[^a-z0-9-]/gi, "_")}.pdf`;
      return new Response(new Uint8Array(buffer), {
        headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="${filename}"`, "cache-control": "private, no-store" },
      });
    }

    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  } catch (error) {
    console.error("[share/download] Error:", error);
    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }
}
