import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { BusinessDocumentPdf } from "@/lib/pdf/business-document";
import { db } from "@/lib/db";
import { getIssuerSnapshot } from "@/lib/finance-service";

export async function renderBusinessDocumentPdf(documentId: string, baseUrl: string): Promise<Buffer> {
  const doc = await db.businessDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new Error("Document not found");

  const issuer = await getIssuerSnapshot();

  return renderToBuffer(
    <BusinessDocumentPdf
      title={doc.title}
      documentNumber={doc.documentNumber}
      documentType={doc.documentType}
      subject={doc.subject}
      recipientName={doc.recipientName}
      companyName={doc.companyName}
      issueDate={doc.issueDate?.toISOString() || null}
      expiryDate={doc.expiryDate?.toISOString() || null}
      contentMarkdown={doc.contentMarkdown}
      senderName={doc.senderName}
      senderRole={doc.senderRole}
      baseUrl={baseUrl}
      issuerLogo={issuer.logo}
      issuerName={issuer.name}
      issuerDetails={issuer.companyDetails}
    />
  );
}
