import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { BusinessDocumentPdf } from "@/lib/pdf/business-document";
import { getIssuerSnapshot } from "@/lib/finance-service";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(request: Request, context: Context) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const doc = await db.businessDocument.findUnique({ where: { id: (await context.params).id } });
    if (!doc) return Response.json({ error: "Document not found" }, { status: 404 });

    const issuer = await getIssuerSnapshot(doc.siteId ?? null);
    const baseUrl = new URL(request.url).origin;

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
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[business-document/pdf] Error:", error);
    return Response.json({ error: "PDF generation failed." }, { status: 500 });
  }
}
