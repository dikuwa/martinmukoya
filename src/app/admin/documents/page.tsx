import Link from "next/link";
import { CreateDocumentPanel, PaymentPanel, RegisterLink } from "@/components/admin/finance-workspace";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { db } from "@/lib/db";
import { formatNad } from "@/lib/financial";

type Props = { searchParams: Promise<{ booking?: string; lead?: string; search?: string; site?: string; type?: string; status?: string }> };
export default async function DocumentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const documentWhere = {
    ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {}),
    ...(params.type && params.type !== "all" ? { type: params.type as "QUOTE" | "INVOICE" | "RECEIPT" } : {}),
    ...(params.status && params.status !== "all" ? { status: params.status as "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "SUPERSEDED" | "VOID" } : {}),
    ...(params.search ? { OR: [{ customerName: { contains: params.search, mode: "insensitive" as const } }, { number: { contains: params.search, mode: "insensitive" as const } }, { booking: { number: { contains: params.search, mode: "insensitive" as const } } }] } : {}),
  };
  const [sites, bookings, leads, documents, payments] = await Promise.all([
    db.site.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    db.booking.findMany({ where: { status: { in: ["DRAFT", "ACTIVE"] } }, orderBy: { createdAt: "desc" }, include: { site: true } }),
    db.lead.findMany({ where: { financialBooking: null, status: { not: "ARCHIVED" }, siteId: { not: null } }, orderBy: { createdAt: "desc" }, include: { site: true } }),
    db.financialDocument.findMany({ where: documentWhere, orderBy: { createdAt: "desc" }, take: 100, include: { booking: true, site: true } }),
    db.payment.findMany({ where: { reversedAt: null, ...(params.site && params.site !== "all" ? { site: { slug: params.site } } : {}), ...(params.search ? { OR: [{ number: { contains: params.search, mode: "insensitive" as const } }, { booking: { customerName: { contains: params.search, mode: "insensitive" as const } } }] } : {}) }, orderBy: { paidAt: "desc" }, take: 100, include: { booking: true, invoice: true, receiptDocument: true, site: true } }),
  ]);
  const sources = [...bookings.map((b) => ({ key: `booking:${b.id}`, kind: "booking" as const, id: b.id, label: `${b.number} · ${b.customerName}`, site: b.site.name, name: b.customerName, email: b.customerEmail || "", phone: b.customerPhone || "", company: b.company || "", description: b.projectDescription })), ...leads.map((l) => ({ key: `lead:${l.id}`, kind: "lead" as const, id: l.id, label: `Lead · ${l.name}`, site: l.site?.name || "", name: l.name, email: l.email, phone: l.phone || "", company: l.company || "", description: l.projectGoal }))];
  const allInvoices = await db.financialDocument.findMany({ where: { type: "INVOICE", status: { in: ["ISSUED", "PARTIALLY_PAID"] } }, include: { payments: { where: { reversedAt: null } } }, orderBy: { issuedAt: "desc" } });
  const invoices = allInvoices.map((d) => { const paid = d.payments.reduce((sum, p) => sum + Number(p.amount), 0); return { id: d.id, label: `${d.number} · ${d.customerName} · ${formatNad(Number(d.total) - paid)} due`, balance: Number(d.total) - paid }; });
  const filterClass = "h-10 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";
  return <div className="grid gap-8">
    <PageHeader title="Documents and payments" description="Create FlexTech Media quotations and invoices, record payments, and issue receipts." actions={<Button asChild variant="secondary"><Link href="/admin/documents/settings">Financial identity</Link></Button>} />
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]"><CreateDocumentPanel sources={sources} initialBooking={params.booking} initialLead={params.lead} /><PaymentPanel invoices={invoices} /></div>
    <form className="flex flex-wrap gap-2 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4"><input name="search" defaultValue={params.search} placeholder="Search number, customer, booking…" className={`${filterClass} min-w-64 flex-1`} /><select name="site" defaultValue={params.site || "all"} className={filterClass}><option value="all">All sites</option>{sites.map((site) => <option key={site.slug} value={site.slug}>{site.name}</option>)}</select><select name="type" defaultValue={params.type || "all"} className={filterClass}><option value="all">All types</option><option value="QUOTE">Quotes</option><option value="INVOICE">Invoices</option><option value="RECEIPT">Receipts</option></select><select name="status" defaultValue={params.status || "all"} className={filterClass}><option value="all">All statuses</option>{["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "SUPERSEDED", "VOID"].map((status) => <option key={status}>{status}</option>)}</select><button className="rounded-xl bg-[color:var(--primary)] px-4 text-sm font-bold text-white">Filter</button><Link href="/admin/documents" className="grid place-items-center rounded-xl px-4 text-sm font-bold">Clear</Link></form>
    <div className="grid gap-5 xl:grid-cols-2"><section className="overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]"><h2 className="border-b border-[color:var(--border-subtle)] p-4 font-display text-xl font-black">Document register</h2>{documents.map((d) => <RegisterLink key={d.id} href={`/admin/documents/${d.id}`} primary={d.number || "Draft"} secondary={`${d.customerName} · ${d.booking.number} · ${d.type} · ${d.status}`} trailing={formatNad(String(d.total))} />)}{!documents.length ? <p className="p-6 text-sm text-[color:var(--text-muted)]">No matching documents.</p> : null}</section><section className="overflow-hidden rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)]"><h2 className="border-b border-[color:var(--border-subtle)] p-4 font-display text-xl font-black">Payment register</h2>{payments.map((p) => <RegisterLink key={p.id} href={p.receiptDocument ? `/admin/documents/${p.receiptDocument.id}` : `/admin/bookings/${p.bookingId}`} primary={p.number} secondary={`${p.booking.customerName} · ${p.method} · ${p.invoice?.number || "Unallocated"}`} trailing={formatNad(String(p.amount))} />)}{!payments.length ? <p className="p-6 text-sm text-[color:var(--text-muted)]">No matching payments.</p> : null}</section></div>
  </div>;
}
