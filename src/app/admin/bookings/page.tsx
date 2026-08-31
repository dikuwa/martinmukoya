import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { formatNad } from "@/lib/financial";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function BookingsPage() {
  const bookings = await db.booking.findMany({ orderBy: { createdAt: "desc" }, include: { site: true, documents: { where: { status: { not: "VOID" } } }, payments: { where: { reversedAt: null } } } });
  return <div className="grid gap-8"><PageHeader title="Bookings" description="Project orders created manually or from qualified leads." actions={<Button asChild><Link href="/admin/bookings/new"><Plus size={16}/>New booking</Link></Button>}/>
    <Card className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-[color:var(--border-subtle)] text-xs uppercase tracking-wider text-[color:var(--text-faint)]"><tr>{["Booking","Customer","Site","Status","Documents","Paid"].map(x=><th key={x} className="px-4 py-3">{x}</th>)}</tr></thead><tbody>{bookings.map((booking)=>{const paid=booking.payments.reduce((sum,p)=>sum+Number(p.amount),0);return <tr key={booking.id} className="border-b border-[color:var(--border-subtle)] last:border-0"><td className="px-4 py-4 font-bold"><Link className="text-[color:var(--primary)]" href={`/admin/bookings/${booking.id}`}>{booking.number}</Link></td><td className="px-4 py-4"><p className="font-semibold">{booking.customerName}</p><p className="text-xs text-[color:var(--text-muted)]">{booking.company||booking.customerEmail||"—"}</p></td><td className="px-4 py-4">{booking.site.name}</td><td className="px-4 py-4">{booking.status}</td><td className="px-4 py-4">{booking.documents.length}</td><td className="px-4 py-4">{formatNad(paid)}</td></tr>})}</tbody></table>{!bookings.length?<p className="p-8 text-center text-sm text-[color:var(--text-muted)]">No bookings yet.</p>:null}</Card>
  </div>;
}
