"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { DashboardSelect } from "@/components/ui/dashboard-select";
import { Button } from "@/components/ui/button";

const field = "h-11 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-4 text-sm outline-none focus:border-[color:var(--primary)]";

export function BookingEditForm({ booking, sites }: { booking: { id: string; siteId: string; customerName: string; customerEmail: string | null; customerPhone: string | null; company: string | null; budgetRange: string | null; projectDescription: string; leadId: string | null }; sites: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const body = { ...Object.fromEntries(new FormData(e.currentTarget)), leadId: booking.leadId };
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
    <form onSubmit={submit} className="grid gap-5 rounded-[18px] border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-6 md:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold">Site
        <DashboardSelect
          name="siteId"
          defaultValue={booking.siteId}
          options={sites.map((s) => ({ label: s.name, value: s.id }))}
          placeholder="Select site"
          className={field}
        />
      </label>
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
      <label className="grid gap-2 text-sm font-bold md:col-span-2">Project description
        <textarea name="projectDescription" defaultValue={booking.projectDescription} className={`${field} min-h-32 py-3`} />
      </label>
      <Button disabled={saving} className="md:col-span-2">
        {saving ? "Saving..." : "Save booking"}
      </Button>
    </form>
  );
}