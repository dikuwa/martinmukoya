import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { BusinessDocumentActions } from "@/components/admin/business-document-actions";
import { BusinessDocumentPreview } from "@/components/documents/business-document-preview";
import { getIssuerSnapshot } from "@/lib/finance-service";

type Props = { params: Promise<{ id: string }> };

const docTypeLabels: Record<string, string> = {
  PROPOSAL: "Proposal", SERVICE_AGREEMENT: "Service Agreement", WEB_DESIGN_CONTRACT: "Web Design Contract",
  MAINTENANCE_AGREEMENT: "Maintenance Agreement", HOSTING_AGREEMENT: "Hosting Agreement", SCOPE_OF_WORK: "Scope of Work",
  PROJECT_BRIEF: "Project Brief", CHANGE_REQUEST: "Change Request", PROJECT_HANDOVER: "Project Handover",
  CLIENT_ACCEPTANCE: "Client Acceptance", BUSINESS_LETTER: "Business Letter", PAYMENT_REMINDER: "Payment Reminder",
  OVERDUE_NOTICE: "Overdue Notice", MEETING_SUMMARY: "Meeting Summary", PROGRESS_REPORT: "Progress Report",
  AUDIT_REPORT: "Audit Report", MAINTENANCE_REPORT: "Maintenance Report", NDA: "NDA / Confidentiality", CUSTOM: "Custom",
};

export default async function BusinessDocumentPage({ params }: Props) {
  const id = (await params).id;
  const doc = await db.businessDocument.findUnique({
    where: { id },
    include: {
      publicShare: true,
      auditLog: { orderBy: { createdAt: "desc" }, take: 50 },
      template: true,
    },
  });
  if (!doc) notFound();

  const issuer = await getIssuerSnapshot();
  const shortLink = doc.publicShare ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/d/${doc.publicShare.shortCode}` : null;

  const previewDoc = {
    id: doc.id,
    documentNumber: doc.documentNumber,
    documentType: doc.documentType,
    status: doc.status,
    title: doc.title,
    subject: doc.subject,
    recipientName: doc.recipientName,
    companyName: doc.companyName,
    recipientEmail: doc.recipientEmail,
    recipientPhone: doc.recipientPhone,
    issueDate: doc.issueDate?.toISOString() || null,
    expiryDate: doc.expiryDate?.toISOString() || null,
    contentMarkdown: doc.contentMarkdown,
    senderName: doc.senderName,
    senderRole: doc.senderRole,
    signatureRequired: doc.signatureRequired,
    recipientWhatsApp: doc.recipientWhatsApp,
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
    <div className="grid gap-6">
      <PageHeader
        title={doc.title}
        description={`${docTypeLabels[doc.documentType] || doc.documentType}${doc.documentNumber ? ` · ${doc.documentNumber}` : ""} · ${doc.status.toLowerCase()}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {doc.status === "DRAFT" && (
              <>
                <Button asChild variant="secondary"><Link href={`/admin/business-documents/${id}/edit`}>Edit draft</Link></Button>
                <Button asChild variant="secondary"><Link href={`/api/admin/business-documents/${id}/pdf`}>Download PDF</Link></Button>
                <BusinessDocumentActions doc={JSON.parse(JSON.stringify(doc))} shortLink={shortLink} />
              </>
            )}
            {doc.status !== "DRAFT" && (
              <>
                <Button asChild variant="secondary"><Link href={`/api/admin/business-documents/${id}/pdf`}>Download PDF</Link></Button>
                <BusinessDocumentActions doc={JSON.parse(JSON.stringify(doc))} shortLink={shortLink} />
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Full Document Preview */}
        <div className="min-w-0">
          <BusinessDocumentPreview
            document={JSON.parse(JSON.stringify(previewDoc))}
            business={businessIdentity}
          />
        </div>

        {/* Sidebar */}
        <aside className="grid gap-4">
          <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
            <h3 className="font-bold text-sm mb-3">Details</h3>
            <dl className="grid gap-2 text-sm">
              {doc.documentNumber && <><dt className="text-[color:var(--text-faint)] text-xs">Number</dt><dd>{doc.documentNumber}</dd></>}
              {doc.recipientName && <><dt className="text-[color:var(--text-faint)] text-xs">Recipient</dt><dd>{doc.recipientName}</dd></>}
              {doc.recipientEmail && <><dt className="text-[color:var(--text-faint)] text-xs">Email</dt><dd>{doc.recipientEmail}</dd></>}
              {doc.companyName && <><dt className="text-[color:var(--text-faint)] text-xs">Company</dt><dd>{doc.companyName}</dd></>}
              {doc.issueDate && <><dt className="text-[color:var(--text-faint)] text-xs">Issue date</dt><dd>{new Date(doc.issueDate).toLocaleDateString("en-GB")}</dd></>}
              {doc.expiryDate && <><dt className="text-[color:var(--text-faint)] text-xs">Expiry</dt><dd>{new Date(doc.expiryDate).toLocaleDateString("en-GB")}</dd></>}
              {doc.template && <><dt className="text-[color:var(--text-faint)] text-xs">Template</dt><dd>{doc.template.name}</dd></>}
              {doc.senderName && <><dt className="text-[color:var(--text-faint)] text-xs">Sender</dt><dd>{doc.senderName}{doc.senderRole ? ` (${doc.senderRole})` : ""}</dd></>}
            </dl>
          </div>

          {doc.publicShare && (
            <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
              <h3 className="font-bold text-sm mb-3">Sharing</h3>
              <dl className="grid gap-2 text-sm">
                <dt className="text-[color:var(--text-faint)] text-xs">Views</dt><dd>{doc.publicShare.viewCount}</dd>
                <dt className="text-[color:var(--text-faint)] text-xs">Downloads</dt><dd>{doc.publicShare.downloadCount}</dd>
                {doc.publicShare.firstViewedAt && <><dt className="text-[color:var(--text-faint)] text-xs">First viewed</dt><dd>{new Date(doc.publicShare.firstViewedAt).toLocaleDateString("en-GB")}</dd></>}
                {doc.publicShare.lastViewedAt && <><dt className="text-[color:var(--text-faint)] text-xs">Last viewed</dt><dd>{new Date(doc.publicShare.lastViewedAt).toLocaleDateString("en-GB")}</dd></>}
              </dl>
            </div>
          )}

          {doc.internalNotes && (
            <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
              <h3 className="font-bold text-sm mb-2">Internal notes</h3>
              <p className="text-sm text-[color:var(--text-muted)] whitespace-pre-wrap">{doc.internalNotes}</p>
            </div>
          )}

          <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
            <h3 className="font-bold text-sm mb-3">Audit log</h3>
            <div className="grid gap-2 text-xs">
              {doc.auditLog.slice(0, 10).map((log) => (
                <div key={log.id} className="flex justify-between">
                  <span className="font-semibold">{log.action}</span>
                  <span className="text-[color:var(--text-faint)]">{new Date(log.createdAt).toLocaleString("en-GB")}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
