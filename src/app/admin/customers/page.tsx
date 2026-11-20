import Link from "next/link";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/ui/page-header";
import { CustomerForm } from "@/components/admin/customer-form";
import { Card } from "@/components/ui/card";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
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
        <form method="get" className="mb-4"><input aria-label="Search customers" name="q" defaultValue={q}
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
      <div><h2 className="mb-3 font-semibold">Add customer</h2><CustomerForm/></div>
    </div>
  </div>;
}