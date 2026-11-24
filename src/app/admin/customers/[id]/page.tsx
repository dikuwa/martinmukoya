import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CustomerForm } from "@/components/admin/customer-form";
import { QuickJobForm } from "@/components/admin/quick-job-form";
import { PageHeader } from "@/components/ui/page-header";
import { computeOutstanding, formatNad, sumActivePayments } from "@/lib/financial";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const customer = await db.contact.findUnique({ where: { id: (await params).id },
    include: { bookings: { include: { documents: { orderBy: { createdAt: "desc" }, include: { payments: { where: { reversedAt: null } } } }, payments: { include: { invoice: { select: { id: true, number: true } } } } }, orderBy: { createdAt: "desc" } } } });
  if (!customer) notFound();
  const [sites, services] = await Promise.all([
    db.site.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    db.serviceCatalogItem.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  const invoices = customer.bookings.flatMap(job => job.documents).filter(doc => doc.type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID", "PAID"].includes(doc.status));
  const totalInvoiced = invoices.reduce((sum, doc) => sum + Number(doc.total), 0);
  const totalPaid = invoices.reduce((sum, doc) => sum + doc.payments.reduce((sub, payment) => sub + Number(payment.amount), 0), 0);
  const payments = customer.bookings.flatMap(job => job.payments).sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());
  const unallocated = sumActivePayments(payments.filter(payment => !payment.invoiceId));
  const outstanding = invoices.reduce((sum, doc) => sum + computeOutstanding(doc.total, sumActivePayments(doc.payments)), 0);
  return <div className="grid gap-6">
    <PageHeader title={customer.name} description={[customer.company, customer.phone, customer.email].filter(Boolean).join(" · ")}
      actions={<div className="flex flex-wrap gap-3 text-sm">
        <Link href={`/admin/bookings/new?customer=${customer.id}`} className="underline">New project</Link>
        <Link href="/admin/customers" className="underline">All customers</Link>
      </div>}/>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-md border border-[color:var(--border-subtle)] p-3"><p className="text-xs text-[color:var(--text-muted)]">Invoiced</p><p className="mt-1 text-xl font-semibold">{formatNad(totalInvoiced)}</p></div>
      <div className="rounded-md border border-[color:var(--border-subtle)] p-3"><p className="text-xs text-[color:var(--text-muted)]">Paid against invoices</p><p className="mt-1 text-xl font-semibold">{formatNad(totalPaid)}</p></div>
      <div className="rounded-md border border-[color:var(--border-subtle)] p-3"><p className="text-xs text-[color:var(--text-muted)]">Outstanding on invoices</p><p className="mt-1 text-xl font-semibold">{formatNad(outstanding)}</p></div>
    </div>
    {unallocated > 0 && <p className="text-sm text-[color:var(--text-muted)]">Unallocated project deposits: {formatNad(unallocated)}. These are not counted as invoice payments until reconciled.</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <div><h2 className="mb-3 font-semibold">Contact details</h2><CustomerForm customer={{ id: customer.id, name: customer.name, company: customer.company, email: customer.email, phone: customer.phone, whatsAppNumber: customer.whatsAppNumber, address: customer.address, town: customer.town, notes: customer.notes, status: customer.status }}/></div>
      <QuickJobForm customerId={customer.id} sites={sites} services={services.map(service => ({ id: service.id, name: service.name, description: service.description, price: service.price.toString() }))}/>
    </div>
    <section className="grid gap-3">
      <h2 className="font-semibold">Jobs, quotations and invoices</h2>
      {customer.bookings.map(job => <div key={job.id} className="rounded-md border border-[color:var(--border-subtle)] p-3">
        <div className="flex flex-wrap justify-between gap-2"><span className="text-sm font-medium">{job.projectDescription}</span>
          <Link href={`/admin/bookings/${job.id}/edit`} className="text-sm underline">Edit {job.kind === "SERVICE" ? "quick service" : "project"}</Link>
          <Link href={`/admin/documents?booking=${job.id}`} className="text-sm underline">New quote or invoice</Link></div>
        {job.documents.map(doc => <Link key={doc.id} href={`/admin/documents/${doc.id}`}
          className="mt-2 flex justify-between gap-2 text-sm text-[color:var(--text-muted)]">
          <span>{doc.number || "Draft"} · {doc.type} · {doc.status}</span><span>{formatNad(String(doc.total))}
            {invoices.some(invoice => invoice.id === doc.id) && <> · {formatNad(computeOutstanding(doc.total, sumActivePayments(doc.payments)))} outstanding</>}
          </span>
        </Link>)}
      </div>)}
      {!customer.bookings.length && <p className="text-sm text-[color:var(--text-muted)]">No jobs yet. Create a quick service above.</p>}
    </section>
    <section className="grid gap-3">
      <h2 className="font-semibold">Payment history</h2>
      {!payments.length && <p className="text-sm text-[color:var(--text-muted)]">No payments recorded.</p>}
      {payments.map(payment => <div key={payment.id} className="flex flex-wrap justify-between gap-3 rounded-md border border-[color:var(--border-subtle)] p-3 text-sm">
        <div>
          <p className="font-medium">{payment.number} · {payment.paidAt.toISOString().slice(0, 10)}</p>
          <div className="flex flex-wrap gap-3">
            {payment.invoice
              ? <Link className="underline" href={`/admin/documents/${payment.invoice.id}`}>{payment.invoice.number || "Invoice"}</Link>
              : <Link className="underline" href={`/admin/bookings/${payment.bookingId}`}>Project deposit</Link>}
            {payment.receiptDocumentId && <Link className="underline" href={`/admin/documents/${payment.receiptDocumentId}`}>Receipt</Link>}
          </div>
        </div>
        <div>{formatNad(String(payment.amount))}{payment.reversedAt && <p>Reversed {payment.reversedAt.toISOString().slice(0, 10)}</p>}</div>
      </div>)}
    </section>
  </div>;
}