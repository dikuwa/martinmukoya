"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { DashboardSelect } from "@/components/ui/dashboard-select";

type Customer = {
  id: string; name: string; company: string | null; email: string | null;
  phone: string | null; whatsAppNumber: string | null; address: string | null;
  town: string | null; notes: string | null; status: string;
};
const field = "h-10 w-full rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] px-3 text-sm";
export function CustomerForm({ customer }: { customer?: Customer }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setExisting("");
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await fetch(customer ? `/api/admin/customers/${customer.id}` : "/api/admin/customers", {
        method: customer ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.status === 409 && data.existingId) { setExisting(data.existingId); return; }
      if (!response.ok) throw new Error(data.error || data.issues?.[0]?.message || "Could not save customer.");
      toast.success(customer ? "Customer updated" : "Customer created");
      router.push(`/admin/customers/${data.id}`);
      router.refresh();
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save customer."); }
    finally { setSaving(false); }
  }
  const inputs = [
    ["name", "Name *"], ["company", "Company"], ["email", "Email"],
    ["phone", "Phone"], ["whatsAppNumber", "WhatsApp"], ["address", "Address"],
    ["town", "Town"],
  ] as const;
  return <form onSubmit={submit} className="grid gap-4 rounded-md border border-[color:var(--border-subtle)] bg-[color:var(--surface)] p-4">
    <div className="grid gap-3 sm:grid-cols-2">{inputs.map(([name,label]) =>
      <label key={name} className="grid gap-1 text-sm font-medium">{label}
        <input className={field} name={name} type={name === "email" ? "email" : "text"}
          defaultValue={customer?.[name] || ""} required={name === "name"}/>
      </label>)}
      <label className="grid gap-1 text-sm font-medium">Stage
        <DashboardSelect name="status" defaultValue={customer?.status || "CUSTOMER"} className={field}
          options={["LEAD","PROSPECT","CUSTOMER","INACTIVE"].map(status => ({ label: status, value: status }))}/>
      </label>
    </div>
    <label className="grid gap-1 text-sm font-medium">Notes
      <textarea name="notes" defaultValue={customer?.notes || ""} rows={3} className={field + " h-auto py-2"}/>
    </label>
    {existing && <p role="alert" className="text-sm">This contact may already exist. <a className="underline" href={`/admin/customers/${existing}`}>Open existing customer</a></p>}
    <div><Button disabled={saving}>{saving ? "Saving…" : customer ? "Save changes" : "Add customer"}</Button></div>
  </form>;
}