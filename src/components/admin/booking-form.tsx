"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { Card } from "@/components/ui/card";

const field = "h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm outline-none focus:border-[color:var(--primary)]";

export function BookingForm({ sites, customer }: { sites: Array<{ id: string; name: string; slug: string }>; customer?: { id: string; name: string; email: string | null; phone: string | null; company: string | null } | null }) {
  const router = useRouter(); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); const data = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
    const payload = await response.json(); setSaving(false); if (!response.ok) return toast.error(payload.error || "Booking could not be created");
    toast.success("Booking created"); router.push(`/admin/bookings/${payload.id}`); router.refresh();
  }
  return <Card as="form" method="post" padding="lg" className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
    {customer && <input type="hidden" name="contactId" value={customer.id}/>}
    <label className="grid gap-2 text-sm font-semibold">Issuing business
      <DashboardSelect
        name="siteId"
        defaultValue={sites.find(site => site.slug === "flextech-media")?.id || sites[0]?.id}
        required
        options={sites.map((site)=>({ label: site.name, value: site.id }))}
        placeholder="Select site"
        className={field}
      />
    </label>
    <label className="grid gap-2 text-sm font-semibold">Booking source
      <DashboardSelect
        name="source"
        defaultValue="walk-in"
        options={[
          { value: "walk-in", label: "Walk-in" },
          { value: "referral", label: "Referral" },
          { value: "phone", label: "Phone call" },
          { value: "WhatsApp", label: "WhatsApp" },
          { value: "email", label: "Email" },
          { value: "website", label: "Website enquiry" },
          { value: "manual", label: "Manual / existing client" },
          { value: "other", label: "Other" },
        ]}
        className={field}
      />
    </label>
    <p className="text-xs text-[color:var(--text-muted)] md:col-span-2">The issuing business controls the letterhead and invoices. The booking source tells you how this work arrived; it does not have to come from either website.</p>
    <label className="grid gap-2 text-sm font-bold">Customer name<input name="customerName" defaultValue={customer?.name} required className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Email<input name="customerEmail" type="email" defaultValue={customer?.email || ""} className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Phone<input name="customerPhone" defaultValue={customer?.phone || ""} className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Company<input name="company" defaultValue={customer?.company || ""} className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Budget range<input name="budgetRange" className={field}/></label>
    <label className="grid gap-2 text-sm font-bold">Contract amount (N$)<input name="contractAmount" type="number" min="0" step="0.01" className={field}/></label>
    <label className="grid gap-2 text-sm font-bold md:col-span-2">Project description<textarea name="projectDescription" required className={`${field} min-h-32 py-3`}/></label>
    <button disabled={saving} className="rounded-xl bg-[color:var(--primary)] px-5 py-3 text-sm font-bold text-white disabled:opacity-50 md:col-span-2">{saving?"Creating...":"Create booking"}</button>
  </Card>;
}