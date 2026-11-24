"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const field = "h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm outline-none focus:border-[color:var(--primary)]";

export function BookingEditForm({ booking, sites, customers }: { booking: { id: string; kind: string; contactId: string | null; siteId: string; source: string; customerName: string; customerEmail: string | null; customerPhone: string | null; company: string | null; budgetRange: string | null; projectDescription: string; leadId: string | null; contractAmount: { toString(): string } | string | number | null }; sites: Array<{ id: string; name: string }>; customers: Array<{ id: string; name: string; email: string | null }> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const body = { ...Object.fromEntries(form), promoteToProject: form.has("promoteToProject") };
    const response = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) return toast.error(payload.error || "Booking could not be updated");
    toast.success("Booking updated");
    router.push(`/admin/bookings/${booking.id}`);
    router.refresh();
  }

  return (
    <Card as="form" padding="lg" className="grid gap-5 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-bold">Site
        <DashboardSelect
          name="siteId"
          defaultValue={booking.siteId}
          options={sites.map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select site"
          className={field}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">Linked customer
        <DashboardSelect name="contactId" defaultValue={booking.contactId ?? ""}
          options={[{ value: "", label: "Keep current link" }, ...customers.map(customer => ({
            value: customer.id, label: [customer.name, customer.email].filter(Boolean).join(" · "),
          }))]} className={field}/>
      </label>
      <label className="grid gap-2 text-sm font-bold">How this booking arrived
        <DashboardSelect
          name="source"
          defaultValue={booking.source}
          options={[
            { value: "unspecified", label: "Not recorded" },
            { value: "walk-in", label: "Walk-in" },
            { value: "referral", label: "Referral" },
            { value: "phone", label: "Phone call" },
            { value: "WhatsApp", label: "WhatsApp" },
            { value: "email", label: "Email" },
            { value: "website", label: "Website enquiry" },
            { value: "manual", label: "Manual / existing client" },
            { value: "other", label: "Other" },
            ...(!["unspecified", "walk-in", "referral", "phone", "WhatsApp", "email", "website", "manual", "other"].includes(booking.source) ? [{ value: booking.source, label: booking.source }] : []),
          ]}
          className={field}
        />
      </label>
      {booking.kind === "SERVICE" && <label className="flex items-center gap-2 text-sm font-bold md:col-span-2">
        <input type="checkbox" name="promoteToProject"/> Promote this quick service to a project
      </label>}
      {[
        ["customerName", "Customer name"],
        ["customerEmail", "Email"],
        ["customerPhone", "Phone"],
        ["company", "Company"],
        ["budgetRange", "Budget range"],
      ].map(([name, label]) => (
        <label key={name} className="grid gap-2 text-sm font-bold">
          {label}
          <input name={name} defaultValue={String(booking[name as keyof typeof booking] || "")} className={field} />
        </label>
      ))}
      <label className="grid gap-2 text-sm font-bold">Contract amount (N$)
        <input name="contractAmount" type="number" min="0" step="0.01" defaultValue={booking.contractAmount != null ? String(booking.contractAmount) : ""} className={field} />
      </label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">Project description
        <textarea name="projectDescription" defaultValue={booking.projectDescription} className={`${field} min-h-32 py-3`} />
      </label>
      <Button disabled={saving} className="md:col-span-2">
        {saving ? "Saving..." : "Save booking"}
      </Button>
    </Card>
  );
}