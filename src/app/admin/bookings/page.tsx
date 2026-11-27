import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatNad } from "@/lib/financial";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LiveSearchInput } from "@/components/admin/live-search-input";

type Props = { searchParams: Promise<{ search?: string }> };
export default async function BookingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const bookings = await db.booking.findMany({ where: params.search ? { OR: [{ number: { contains: params.search, mode: "insensitive" } }, { customerName: { contains: params.search, mode: "insensitive" } }, { customerEmail: { contains: params.search, mode: "insensitive" } }, { company: { contains: params.search, mode: "insensitive" } }] } : undefined, orderBy: { createdAt: "desc" }, include: { site: true, documents: { where: { status: { not: "VOID" } } }, payments: { where: { reversedAt: null } } } });
  return <div className="grid gap-8"><PageHeader title="Bookings" description="Project orders created manually or from qualified leads." actions={<Button asChild><Link href="/admin/bookings/new"><Plus size={16}/>New booking</Link></Button>}/>
    <LiveSearchInput defaultValue={params.search} placeholder="Search bookings…" aria-label="Search bookings" className="h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm" />
    <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[color:var(--border-subtle)] text-xs uppercase tracking-wider text-[color:var(--text-faint)]"><tr>{["Booking","Customer","Issuer","Source","Status","Documents","Paid"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{bookings.map((booking)=>{const paid=booking.payments.reduce((sum,p)=>sum+Number(p.amount),0);return <tr key={booking.id} className="border-b border-[color:var(--border-subtle)] last:border-0"><td className="px-4 py-4 font-bold"><Link className="text-[color:var(--primary)]" href={`/admin/bookings/${booking.id}`}>{booking.number}</Link></td><td className="px-4 py-4"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-[color:var(--text-muted)]">{booking.company||booking.customerEmail||"—"}</p></td><td className="px-4 py-4">{booking.site.name}</td><td className="px-4 py-4">{booking.source === "unspecified" ? "—" : booking.source}</td><td className="px-4 py-4">{booking.status}</td><td className="px-4 py-4">{booking.documents.length}</td><td className="px-4 py-4">{formatNad(paid)}</td></tr>})}</tbody></table>{!bookings.length?<p className="p-8 text-center text-sm text-[color:var(--text-muted)]">No bookings yet.</p>:null}</Card>
  </div>;
}
