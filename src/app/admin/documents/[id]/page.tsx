import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { DocumentActions } from "@/components/admin/document-actions";
import { FinancialDocumentPreview } from "@/components/admin/financial-document-preview";
import { Card } from "@/components/ui/card";
import { InvoiceReminderActions } from "@/components/admin/invoice-reminder-actions";
import { sharedDocumentIsPublic } from "@/lib/shared-document-access";
import { invoiceReminderDetails, reminderRecipients } from "@/lib/reminder";
import { computeOutstanding, formatNad, sumActivePayments } from "@/lib/financial";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const document = await db.financialDocument.findUnique({
    where: { id: (await params).id },
    include: {
      booking: { include: { contact: true, lead: true } },
      lineItems: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { paidAt: "asc" }, include: { receiptDocument: true } },
      receiptForPayment: true,
      sharedDocument: true,
      revisions: { orderBy: { createdAt: "desc" }, select: { id: true, number: true, status: true, createdAt: true } },
    },
  });
  if (!document) notFound();
  const reminder = document.type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID"].includes(document.status)
    ? invoiceReminderDetails(document) : null;
  const reminderHistory = document.type === "INVOICE"
    ? await db.invoiceReminder.findMany({ where: { invoiceId: document.id }, orderBy: { createdAt: "desc" }, take: 5 })
    : [];

  const shortLink = document.sharedDocument
    ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/d/${document.sharedDocument.shortCode}`
    : null;
  const recipients = reminderRecipients(document);
  const reminderLink = document.sharedDocument && sharedDocumentIsPublic({ ...document.sharedDocument, financialDocument: document }) ? shortLink : null;
  const paid = sumActivePayments(document.payments);
  const outstanding = computeOutstanding(document.total, paid);
  const paymentStatus = document.status === "PAID" || outstanding === 0 ? "Paid" : document.status === "PARTIALLY_PAID" ? "Partially paid" : document.status === "VOID" ? "Voided" : "Awaiting payment";
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
          {reminder && reminder.balance > 0 && <Link className="text-sm font-medium underline" href={`/admin/documents?invoice=${document.id}#record-payment`}>Record payment against this invoice</Link>}
          {reminder && reminder.balance > 0 && (
            <InvoiceReminderActions invoiceId={document.id} message={reminder.message}
              phone={recipients.phone} email={recipients.email}
              shareLink={reminderLink} balance={reminder.balance}/>
          )}
          {!!reminderHistory.length && <Card padding="md">
            <h3 className="mb-3 text-sm font-semibold">Reminder history</h3>
            <div className="grid gap-2">{reminderHistory.map(item =>
              <p key={item.id} className="text-xs text-[color:var(--text-muted)]">
                {item.createdAt.toLocaleDateString("en-GB")} · {item.channel} · Prepared (not confirmed sent)
              </p>)}</div>
          </Card>}
          <Card padding="md">
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
              {document.acceptedAt && <><dt className="text-[color:var(--text-faint)] text-xs">Accepted</dt><dd>{document.acceptedName ? `${document.acceptedName} on ` : ""}{new Date(document.acceptedAt).toLocaleDateString("en-GB")}</dd></>}
              {document.declinedAt && <><dt className="text-[color:var(--text-faint)] text-xs">Declined</dt><dd>{new Date(document.declinedAt).toLocaleDateString("en-GB")}</dd></>}
            </dl>
          </Card>

          {document.type === "INVOICE" && <Card padding="md">
            <h3 className="font-bold text-sm mb-3">Financial history</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-xs text-[color:var(--text-faint)]">Invoice total</dt><dd className="font-semibold">{formatNad(String(document.total))}</dd></div>
              <div><dt className="text-xs text-[color:var(--text-faint)]">Received</dt><dd className="font-semibold">{formatNad(paid)}</dd></div>
              <div><dt className="text-xs text-[color:var(--text-faint)]">Outstanding</dt><dd className="font-semibold">{formatNad(outstanding)}</dd></div>
              <div><dt className="text-xs text-[color:var(--text-faint)]">Status</dt><dd className="font-semibold">{paymentStatus}</dd></div>
            </dl>
            <div className="mt-4 border-t border-[color:var(--border-subtle)] pt-3">
              <p className="text-xs font-semibold text-[color:var(--text-muted)]">Transactions</p>
              <div className="mt-2 grid gap-2">
                {document.payments.map(payment => <div key={payment.id} className="flex items-start justify-between gap-3 text-xs">
                  <span>{new Date(payment.paidAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} · {payment.method === "BANK_TRANSFER" ? "Bank transfer" : payment.method}{payment.reversedAt ? " · Reversed" : ""}</span>
                  <span className="font-semibold tabular-nums">{formatNad(String(payment.amount))}</span>
                </div>)}
                {!document.payments.length && <p className="text-xs text-[color:var(--text-muted)]">No payments recorded.</p>}
                {document.revisions.map(revision => <Link key={revision.id} href={`/admin/documents/${revision.id}`} className="text-xs text-[color:var(--primary)]">Revision {revision.number || "Draft"} · {revision.status}</Link>)}
              </div>
            </div>
          </Card>}

          {document.sharedDocument && (
            <Card padding="md">
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
            </Card>
          )}

          {(document.notes || document.paymentTerms) && (
            <Card padding="md">
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
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
