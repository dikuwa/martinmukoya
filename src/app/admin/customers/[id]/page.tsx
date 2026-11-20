import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CustomerForm } from "@/components/admin/customer-form";
import { QuickJobForm } from "@/components/admin/quick-job-form";
import { PageHeader } from "@/components/ui/page-header";
import { formatNad } from "@/lib/financial";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const customer = await db.contact.findUnique({ where: { id: (await params).id },
    include: { bookings: { include: { documents: { orderBy: { createdAt: "desc" }, include: { payments: { where: { reversedAt: null } } } }, payments: { where: { reversedAt: null } } }, orderBy: { createdAt: "desc" } } } });
  if (!customer) notFound();
  const [sites, services] = await Promise.all([
    db.site.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
    db.serviceCatalogItem.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);
  const invoices = customer.bookings.flatMap(job => job.documents).filter(doc => doc.type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID", "PAID"].includes(doc.status));
  const totalInvoiced = invoices.reduce((sum, doc) => sum + Number(doc.total), 0);
  const totalPaid = invoices.reduce((sum, doc) => sum + doc.payments.reduce((sub, payment) => sub + Number(payment.amount), 0), 0);
  const unallocated = customer.bookings.flatMap(job => job.payments).filter(payment => !payment.invoiceId).reduce((sum, payment) => sum + Number(payment.amount), 0);
  return <div className="grid gap-6">
    <PageHeader title={customer.name} description={[customer.company, customer.phone, customer.email].filter(Boolean).join(" · ")}
      actions={<div className="flex flex-wrap gap-3 text-sm">
        <Link href={`/admin/bookings/new?customer=${customer.id}`} className="underline">New project</Link>
        <Link href="/admin/customers" className="underline">All customers</Link>
      </div>}/>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-md border border-[color:var(--border-subtle)] p-3"><p className="text-xs text-[color:var(--text-muted)]">Invoiced</p><p className="mt-1 text-xl font-semibold">{formatNad(totalInvoiced)}</p></div>
      <div className="rounded-md border border-[color:var(--border-subtle)] p-3"><p className="text-xs text-[color:var(--text-muted)]">Paid against invoices</p><p className="mt-1 text-xl font-semibold">{formatNad(totalPaid)}</p></div>
      <div className="rounded-md border border-[color:var(--border-subtle)] p-3"><p className="text-xs text-[color:var(--text-muted)]">Outstanding on invoices</p><p className="mt-1 text-xl font-semibold">{formatNad(Math.max(0, totalInvoiced - totalPaid))}</p></div>
    </div>
    {unallocated > 0 && <p className="text-sm text-[color:var(--text-muted)]">Unallocated project deposits: {formatNad(unallocated)}. These are not counted as invoice payments until reconciled.</p>}
    <div className="grid gap-5 lg:grid-cols-2">
      <div><h2 className="mb-3 font-semibold">Contact details</h2><CustomerForm customer={customer}/></div>
      <QuickJobForm customerId={customer.id} sites={sites} services={services}/>
    </div>
    <section className="grid gap-3">
      <h2 className="font-semibold">Jobs, quotations and invoices</h2>
      {customer.bookings.map(job => <div key={job.id} className="rounded-md border border-[color:var(--border-subtle)] p-3">
        <div className="flex flex-wrap justify-between gap-2"><span className="text-sm font-medium">{job.projectDescription}</span>
          <Link href={`/admin/documents?booking=${job.id}`} className="text-sm underline">New quote or invoice</Link></div>
        {job.documents.map(doc => <Link key={doc.id} href={`/admin/documents/${doc.id}`}
          className="mt-2 flex justify-between gap-2 text-sm text-[color:var(--text-muted)]">
          <span>{doc.number || "Draft"} · {doc.type} · {doc.status}</span><span>{formatNad(String(doc.total))}</span>
        </Link>)}
      </div>)}
      {!customer.bookings.length && <p className="text-sm text-[color:var(--text-muted)]">No jobs yet. Create a quick service above.</p>}
    </section>
  </div>;
}