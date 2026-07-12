import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { DocumentActions } from "@/components/admin/document-actions";
import { FinancialDocumentPreview } from "@/components/admin/financial-document-preview";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const document = await db.financialDocument.findUnique({
    where: { id: (await params).id },
    include: {
      booking: true,
      lineItems: { orderBy: { sortOrder: "asc" } },
      payments: true,
      receiptForPayment: true,
      sharedDocument: true,
    },
  });
  if (!document) notFound();

  const shortLink = document.sharedDocument
    ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/d/${document.sharedDocument.shortCode}`
    : null;
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/documents" className="text-sm font-bold text-[color:var(--primary)]">
            ← Documents
          </Link>
          <h1 className="mt-2 font-display text-3xl font-black">
            {document.number || `Draft ${document.type.toLowerCase()}`}
          </h1>
          <p className="text-sm text-[color:var(--text-muted)]">
            {document.customerName} · {document.status}
          </p>
        </div>
        <DocumentActions
          id={document.id}
          type={document.type}
          status={document.status}
          number={document.number}
          customerName={document.customerName}
          customerPhone={document.customerPhone}
          email={document.customerEmail}
          shortLink={shortLink}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Document Preview */}
        <div className="min-w-0">
          <FinancialDocumentPreview document={document} />
        </div>

        {/* Sidebar */}
        <aside className="grid gap-4">
          <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
            <h3 className="font-bold text-sm mb-3">Details</h3>
            <dl className="grid gap-2 text-sm">
              <dt className="text-[color:var(--text-faint)] text-xs">Number</dt><dd>{document.number || "Draft"}</dd>
              <dt className="text-[color:var(--text-faint)] text-xs">Type</dt><dd>{document.type}</dd>
              <dt className="text-[color:var(--text-faint)] text-xs">Status</dt><dd>{document.status}</dd>
              <dt className="text-[color:var(--text-faint)] text-xs">Customer</dt><dd>{document.customerName}</dd>
              {document.customerCompany && <><dt className="text-[color:var(--text-faint)] text-xs">Company</dt><dd>{document.customerCompany}</dd></>}
              {document.customerEmail && <><dt className="text-[color:var(--text-faint)] text-xs">Email</dt><dd>{document.customerEmail}</dd></>}
              {document.booking && <><dt className="text-[color:var(--text-faint)] text-xs">Booking</dt><dd>{document.booking.number}</dd></>}
              {document.issuedAt && <><dt className="text-[color:var(--text-faint)] text-xs">Issued</dt><dd>{new Date(document.issuedAt).toLocaleDateString("en-GB")}</dd></>}
            </dl>
          </div>

          {document.sharedDocument && (
            <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
              <h3 className="font-bold text-sm mb-3">Sharing</h3>
              <dl className="grid gap-2 text-sm">
                <dt className="text-[color:var(--text-faint)] text-xs">Views</dt><dd>{document.sharedDocument.viewCount}</dd>
                <dt className="text-[color:var(--text-faint)] text-xs">Downloads</dt><dd>{document.sharedDocument.downloadCount}</dd>
                {document.sharedDocument.firstViewedAt && (
                  <><dt className="text-[color:var(--text-faint)] text-xs">First viewed</dt><dd>{new Date(document.sharedDocument.firstViewedAt).toLocaleDateString("en-GB")}</dd></>
                )}
                {document.sharedDocument.lastViewedAt && (
                  <><dt className="text-[color:var(--text-faint)] text-xs">Last viewed</dt><dd>{new Date(document.sharedDocument.lastViewedAt).toLocaleDateString("en-GB")}</dd></>
                )}
                {document.sharedDocument.shareEnabled === false && (
                  <><dt className="text-[color:var(--text-faint)] text-xs">Status</dt><dd className="text-red-600">Revoked</dd></>
                )}
              </dl>
            </div>
          )}

          {(document.notes || document.paymentTerms) && (
            <div className="rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-5">
              {document.notes && (
                <>
                  <h3 className="font-bold text-sm mb-2">Notes</h3>
                  <p className="text-sm text-[color:var(--text-muted)] whitespace-pre-wrap">{document.notes}</p>
                </>
              )}
              {document.paymentTerms && (
                <>
                  <h3 className="font-bold text-sm mt-3 mb-2">Payment terms</h3>
                  <p className="text-sm text-[color:var(--text-muted)] whitespace-pre-wrap">{document.paymentTerms}</p>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
