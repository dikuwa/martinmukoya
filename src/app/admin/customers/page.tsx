import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/components/admin/customer-form";
import { Card } from "@/components/ui/card";
import { LiveSearchInput } from "@/components/admin/live-search-input";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; lead?: string; booking?: string }> }) {
  const { q, lead: leadId, booking: bookingId } = await searchParams;
  const [sourceLead, sourceBooking] = await Promise.all([
    leadId ? db.lead.findUnique({ where: { id: leadId } }) : Promise.resolve(null),
    bookingId ? db.booking.findUnique({ where: { id: bookingId } }) : Promise.resolve(null),
  ]);
  const initial = sourceBooking
    ? {
        name: sourceBooking.customerName,
        email: sourceBooking.customerEmail,
        phone: sourceBooking.customerPhone,
        company: sourceBooking.company,
        whatsAppNumber: null,
      }
    : sourceLead
      ? {
          name: sourceLead.name,
          email: sourceLead.email,
          phone: sourceLead.phone,
          company: sourceLead.company,
          whatsAppNumber: sourceLead.whatsAppNumber,
        }
      : null;
  const customers = await db.contact.findMany({
    where: q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ] } : {},
    orderBy: { updatedAt: "desc" }, take: 100,
  });
  return <div className="grid gap-6">
    <PageHeader title="Customers" description="Keep client contacts independently of projects and invoices."/>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,23rem)]">
      <Card className="min-w-0 p-4">
        <form method="get" className="mb-4"><LiveSearchInput aria-label="Search customers" name="q" defaultValue={q}
          placeholder="Search customers…" className="h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm"/></form>
        <div className="divide-y divide-[color:var(--border-subtle)]">
          {customers.map(c => <Link key={c.id} href={`/admin/customers/${c.id}`}
            className="flex justify-between gap-3 py-3 text-sm hover:text-[color:var(--primary)]">
            <span><strong>{c.name}</strong><span className="ml-2 text-[color:var(--text-muted)]">{c.company || c.town || ""}</span></span>
            <span className="text-xs text-[color:var(--text-muted)]">{c.status}</span>
          </Link>)}
          {!customers.length && <p className="py-5 text-sm text-[color:var(--text-muted)]">No customers found.</p>}
        </div>
      </Card>
      <div>
        <h2 className="mb-3 font-semibold">{initial ? "Add customer from existing record" : "Add customer"}</h2>
        {initial && <p className="mb-3 text-sm text-[color:var(--text-muted)]">Details are prefilled. Confirm them before saving; existing customers will not be duplicated.</p>}
        <CustomerForm initial={initial} bookingId={sourceBooking?.id} leadId={sourceLead?.id} />
      </div>
    </div>
  </div>;
}
