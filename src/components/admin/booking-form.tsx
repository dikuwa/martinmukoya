"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const field = "h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm outline-none focus:border-[color:var(--primary)]";

export function BookingForm({ sites }: { sites: Array<{ id: string; name: string }> }) {
  const router = useRouter(); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
    const payload = await response.json(); setSaving(false); if (!response.ok) return toast.error(payload.error || "Booking could not be created");
    toast.success("Booking created"); router.push(`/admin/bookings/${payload.id}`); router.refresh();
  }
  return <Card as="form" padding="lg" className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
    <label className="grid gap-2 text-sm font-bold">Site
      <DashboardSelect
        name="siteId"
        required
        options={sites.map((site)=>({ label: site.name, value: site.id }))}
        placeholder="Select site"
        className={field}
      />
    </label>
    <label className="grid gap-2 text-sm font-bold">Customer name<input name="customerName" required className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Email<input name="customerEmail" type="email" className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Phone<input name="customerPhone" className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Company<input name="company" className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Budget range<input name="budgetRange" className={field}/></label>
    <label className="grid gap-2 text-sm font-bold md:col-span-2">Project description<textarea name="projectDescription" required className={`${field} min-h-32 py-3`}/></label>
    <button disabled={saving} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">{saving?"Creating...":"Create booking"}</button>
  </Card>;
}