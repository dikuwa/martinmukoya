import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FinancialDocumentPreview } from "@/components/admin/financial-document-preview";
import { BusinessDocumentPreview } from "@/components/documents/business-document-preview";
import { PublicBusinessDocument } from "@/components/public/public-business-document";
import { trackSharedDocumentView } from "@/lib/business-document-service";
import { getIssuerSnapshot } from "@/lib/finance-service";

type Props = { params: Promise<{ code: string }> };

export default async function SharedDocumentPage({ params }: Props) {
  const code = (await params).code;

  // Support both old /documents/share/:token and new /d/:code
  const share = await db.sharedDocument.findUnique({ where: { shortCode: code } });
  const legacyDoc = share ? null : await db.financialDocument.findUnique({ where: { shareToken: code } });

  if (!share && !legacyDoc) notFound();

  // Handle legacy share tokens - redirect to new share format
  if (legacyDoc && !share) {
    const existing = await db.sharedDocument.findUnique({ where: { financialDocumentId: legacyDoc.id } });
    if (!existing) {
      const newShare = await db.sharedDocument.create({
        data: {
          shortCode: code.slice(0, 7),
          documentType: "financial",
          financialDocumentId: legacyDoc.id,
        }
      });
      redirect(`/d/${newShare.shortCode}`);
    } else {
      redirect(`/d/${existing.shortCode}`);
    }
  }

  if (!share || !share.shareEnabled || (share.expiresAt && share.expiresAt < new Date())) notFound();

  // Track view asynchronously
  void trackSharedDocumentView(code).catch(() => undefined);

  if (share.documentType === "financial") {
    const document = await db.financialDocument.findUnique({
      where: { id: share.financialDocumentId! },
      include: { booking: true, lineItems: { orderBy: { sortOrder: "asc" } }, payments: true, receiptForPayment: true },
    });
    if (!document || document.status === "DRAFT") notFound();

    return (
      <main className="min-h-screen bg-[#f3f0e9] p-4 md:p-10">
        <FinancialDocumentPreview document={document} />
      </main>
    );
  }

  if (share.documentType === "business") {
    const document = await db.businessDocument.findUnique({
      where: { id: share.businessDocumentId! },
      include: { auditLog: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
    if (!document) notFound();

    const issuer = await getIssuerSnapshot();

    const previewDoc = {
      id: document.id,
      documentNumber: document.documentNumber,
      documentType: document.documentType,
      status: document.status,
      title: document.title,
      subject: document.subject,
      recipientName: document.recipientName,
      companyName: document.companyName,
      recipientEmail: document.recipientEmail,
      recipientPhone: document.recipientPhone,
      issueDate: document.issueDate?.toISOString() || null,
      expiryDate: document.expiryDate?.toISOString() || null,
      contentMarkdown: document.contentMarkdown,
      senderName: document.senderName,
      senderRole: document.senderRole,
      signatureRequired: document.signatureRequired,
      recipientWhatsApp: document.recipientWhatsApp,
    };

    const businessIdentity = {
      name: issuer.name,
      logo: issuer.logo,
      phone: issuer.phone,
      email: issuer.email,
      address: issuer.address,
      companyDetails: issuer.companyDetails,
      signerName: issuer.signerName,
      signerTitle: issuer.signerTitle,
      signatureMode: issuer.signatureMode,
      signatureImage: issuer.signatureImage,
      showSignature: issuer.showSignature,
      registration: issuer.registration,
    };

    return (
      <main className="min-h-screen bg-[#f3f0e9] p-4 md:p-10">
        <div className="mx-auto max-w-[900px]">
          <BusinessDocumentPreview
            document={JSON.parse(JSON.stringify(previewDoc))}
            business={businessIdentity}
            showDraftMark={false}
          />
          <PublicBusinessDocument
            document={JSON.parse(JSON.stringify(document))}
            shortCode={code}
            hideDocumentContent={true}
          />
        </div>
      </main>
    );
  }

  notFound();
}
